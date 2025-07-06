import express from 'express';
import { ObjectId } from 'mongodb';
import { connectToMongoDB } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all available vendors
router.get('/vendors', authenticate, async (req, res) => {
  try {
    const { db } = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ message: 'Database connection failed' });
    }

    const vendors = await db.collection('vendors').find({}).toArray();
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Error fetching vendors' });
  }
});

// Get collaboration vendors
router.get('/collaborations/:collaborationId/vendors', authenticate, async (req, res) => {
  try {
    const { collaborationId } = req.params;
    const userId = req.user._id;
    
    const { db } = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ message: 'Database connection failed' });
    }

    // Verify user has access to this collaboration
    const collaboration = await db.collection('collaborations').findOne({
      _id: new ObjectId(collaborationId),
      $or: [
        { clientId: new ObjectId(userId) },
        { plannerId: new ObjectId(userId) }
      ],
      status: 'active'
    });

    if (!collaboration) {
      return res.status(404).json({ message: 'Collaboration not found or access denied' });
    }

    // Get collaboration vendors with vendor details and notes
    const collaborationVendors = await db.collection('collaborationVendors').aggregate([
      {
        $match: { 
          collaborationId: new ObjectId(collaborationId) 
        }
      },
      {
        $lookup: {
          from: 'vendors',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      {
        $unwind: '$vendor'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'addedBy',
          foreignField: '_id',
          as: 'addedByUser'
        }
      },
      {
        $unwind: '$addedByUser'
      },
      {
        $lookup: {
          from: 'collaborationNotes',
          let: { vendorId: '$vendorId', collabId: '$collaborationId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$collaborationId', '$$collabId'] },
                    { $eq: ['$vendorId', '$$vendorId'] }
                  ]
                }
              }
            },
            {
              $lookup: {
                from: 'users',
                localField: 'authorId',
                foreignField: '_id',
                as: 'author'
              }
            },
            {
              $unwind: '$author'
            },
            {
              $addFields: {
                authorName: '$author.name',
                isCurrentUser: { $eq: ['$authorId', new ObjectId(userId)] }
              }
            },
            {
              $project: {
                author: 0
              }
            },
            {
              $sort: { createdAt: -1 }
            }
          ],
          as: 'notes'
        }
      },
      {
        $addFields: {
          addedByName: '$addedByUser.name'
        }
      },
      {
        $project: {
          addedByUser: 0
        }
      },
      {
        $sort: { addedAt: -1 }
      }
    ]).toArray();

    res.json(collaborationVendors);
  } catch (error) {
    console.error('Error fetching collaboration vendors:', error);
    res.status(500).json({ message: 'Error fetching collaboration vendors' });
  }
});

// Add vendor to collaboration
router.post('/collaborations/:collaborationId/vendors', authenticate, async (req, res) => {
  try {
    const { collaborationId } = req.params;
    const { vendorId } = req.body;
    const userId = req.user._id;
    
    const { db } = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ message: 'Database connection failed' });
    }

    // Verify user has access to this collaboration
    const collaboration = await db.collection('collaborations').findOne({
      _id: new ObjectId(collaborationId),
      $or: [
        { clientId: new ObjectId(userId) },
        { plannerId: new ObjectId(userId) }
      ],
      status: 'active'
    });

    if (!collaboration) {
      return res.status(404).json({ message: 'Collaboration not found or access denied' });
    }

    // Check if vendor exists
    const vendor = await db.collection('vendors').findOne({
      _id: new ObjectId(vendorId)
    });

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Check if vendor is already in collaboration
    const existingCollaborationVendor = await db.collection('collaborationVendors').findOne({
      collaborationId: new ObjectId(collaborationId),
      vendorId: new ObjectId(vendorId)
    });

    if (existingCollaborationVendor) {
      return res.status(400).json({ message: 'Vendor already added to collaboration' });
    }

    // Add vendor to collaboration
    const collaborationVendor = {
      collaborationId: new ObjectId(collaborationId),
      vendorId: new ObjectId(vendorId),
      addedBy: new ObjectId(userId),
      addedAt: new Date(),
      status: 'considering'
    };

    const result = await db.collection('collaborationVendors').insertOne(collaborationVendor);

    // Return the collaboration vendor with vendor details
    const newCollaborationVendor = await db.collection('collaborationVendors').aggregate([
      {
        $match: { 
          _id: result.insertedId 
        }
      },
      {
        $lookup: {
          from: 'vendors',
          localField: 'vendorId',
          foreignField: '_id',
          as: 'vendor'
        }
      },
      {
        $unwind: '$vendor'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'addedBy',
          foreignField: '_id',
          as: 'addedByUser'
        }
      },
      {
        $unwind: '$addedByUser'
      },
      {
        $addFields: {
          addedByName: '$addedByUser.name',
          notes: []
        }
      },
      {
        $project: {
          addedByUser: 0
        }
      }
    ]).toArray();

    res.status(201).json(newCollaborationVendor[0]);
  } catch (error) {
    console.error('Error adding vendor to collaboration:', error);
    res.status(500).json({ message: 'Error adding vendor to collaboration' });
  }
});

// Update vendor status in collaboration
router.patch('/collaborations/:collaborationId/vendors/:vendorId', authenticate, async (req, res) => {
  try {
    const { collaborationId, vendorId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;
    
    const { db } = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ message: 'Database connection failed' });
    }

    // Verify user has access to this collaboration
    const collaboration = await db.collection('collaborations').findOne({
      _id: new ObjectId(collaborationId),
      $or: [
        { clientId: new ObjectId(userId) },
        { plannerId: new ObjectId(userId) }
      ],
      status: 'active'
    });

    if (!collaboration) {
      return res.status(404).json({ message: 'Collaboration not found or access denied' });
    }

    // Validate status
    const validStatuses = ['considering', 'contacted', 'booked', 'declined'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Update vendor status
    const result = await db.collection('collaborationVendors').updateOne(
      {
        collaborationId: new ObjectId(collaborationId),
        vendorId: new ObjectId(vendorId)
      },
      {
        $set: {
          status: status,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Vendor not found in collaboration' });
    }

    res.json({ message: 'Vendor status updated successfully' });
  } catch (error) {
    console.error('Error updating vendor status:', error);
    res.status(500).json({ message: 'Error updating vendor status' });
  }
});

// Remove vendor from collaboration
router.delete('/collaborations/:collaborationId/vendors/:vendorId', authenticate, async (req, res) => {
  try {
    const { collaborationId, vendorId } = req.params;
    const userId = req.user._id;
    
    const { db } = await connectToMongoDB();
    if (!db) {
      return res.status(500).json({ message: 'Database connection failed' });
    }

    // Verify user has access to this collaboration
    const collaboration = await db.collection('collaborations').findOne({
      _id: new ObjectId(collaborationId),
      $or: [
        { clientId: new ObjectId(userId) },
        { plannerId: new ObjectId(userId) }
      ],
      status: 'active'
    });

    if (!collaboration) {
      return res.status(404).json({ message: 'Collaboration not found or access denied' });
    }

    // Remove vendor from collaboration
    const result = await db.collection('collaborationVendors').deleteOne({
      collaborationId: new ObjectId(collaborationId),
      vendorId: new ObjectId(vendorId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Vendor not found in collaboration' });
    }

    // Also remove all notes for this vendor in this collaboration
    await db.collection('collaborationNotes').deleteMany({
      collaborationId: new ObjectId(collaborationId),
      vendorId: new ObjectId(vendorId)
    });

    res.json({ message: 'Vendor removed from collaboration successfully' });
  } catch (error) {
    console.error('Error removing vendor from collaboration:', error);
    res.status(500).json({ message: 'Error removing vendor from collaboration' });
  }
});

export default router; 