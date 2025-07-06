import React, { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../src/contexts/NextAuthContext";
import Layout from "../src/components/NextLayout";

interface PlannerProfile {
  businessName: string;
  services: string[];
  experience: string;
  description: string;
  pricing: string;
  portfolio: string[];
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
}

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<"client" | "planner">(
    "client"
  );
  const [plannerProfile, setPlannerProfile] = useState<PlannerProfile>({
    businessName: "",
    services: [],
    experience: "",
    description: "",
    pricing: "",
    portfolio: [],
    rating: 0,
    reviewCount: 0,
    isAvailable: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const { register, error, clearError, setGuestMode } = useAuth();
  const router = useRouter();

  const serviceOptions = [
    "Wedding Planning",
    "Corporate Events",
    "Birthday Parties",
    "Anniversary Celebrations",
    "Conferences",
    "Product Launches",
    "Fundraising Events",
    "Holiday Parties",
    "Graduation Celebrations",
    "Retirement Parties",
  ];

  const experienceOptions = [
    "Under 1 year",
    "1-2 years",
    "3-5 years",
    "6-10 years",
    "Over 10 years",
  ];

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");
    clearError();

    // Validate form
    if (!name || !email || !password || !confirmPassword) {
      setFormError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long");
      return;
    }

    // Validate planner profile if account type is planner
    if (accountType === "planner") {
      if (
        !plannerProfile.businessName ||
        !plannerProfile.experience ||
        plannerProfile.services.length === 0
      ) {
        setFormError("Please fill in all required planner profile fields");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      await register(
        name,
        email,
        password,
        accountType,
        accountType === "planner" ? plannerProfile : undefined
      );
      router.push("/create");
    } catch (err) {
      // Error is handled by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestMode = () => {
    setGuestMode(true);
    router.push("/create");
  };

  const handleServiceToggle = (service: string) => {
    setPlannerProfile((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  return (
    <Layout
      children={
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-fun mt-12">
          <h1 className="text-3xl font-display text-primary-600 mb-6 text-center">
            Create Account
          </h1>

          <div className="w-20 h-0.5 bg-primary-300 mx-auto mb-8"></div>

          {(error || formError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-red-600">
              {formError || error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label htmlFor="name" className="block mb-2 text-gray-700">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
                placeholder="Your name"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block mb-2 text-gray-700">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block mb-2 text-gray-700">
                Password *
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
                placeholder="Enter password"
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block mb-2 text-gray-700"
              >
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
                placeholder="Confirm password"
                required
              />
            </div>

            {/* Account Type Selection */}
            <div className="mb-6">
              <label className="block mb-3 text-gray-700 font-medium">
                Account Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    accountType === "client"
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="accountType"
                    value="client"
                    checked={accountType === "client"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAccountType(e.target.value as "client" | "planner")
                    }
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Client</div>
                    <div className="text-sm text-gray-600">
                      Planning an event
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    accountType === "planner"
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="accountType"
                    value="planner"
                    checked={accountType === "planner"}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setAccountType(e.target.value as "client" | "planner")
                    }
                    className="mr-3"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">
                      Event Planner
                    </div>
                    <div className="text-sm text-gray-600">
                      Offering planning services
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Planner Profile Fields */}
            {accountType === "planner" && (
              <div className="mb-6 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Planner Profile
                </h3>

                <div className="mb-4">
                  <label
                    htmlFor="businessName"
                    className="block mb-2 text-gray-700"
                  >
                    Business Name *
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    value={plannerProfile.businessName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPlannerProfile((prev) => ({
                        ...prev,
                        businessName: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
                    placeholder="Your business name"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block mb-2 text-gray-700">
                    Services Offered * (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {serviceOptions.map((service) => (
                      <label
                        key={service}
                        className="flex items-center p-2 hover:bg-gray-100 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={plannerProfile.services.includes(service)}
                          onChange={() => handleServiceToggle(service)}
                          className="mr-2"
                        />
                        <span className="text-sm">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="experience"
                    className="block mb-2 text-gray-700"
                  >
                    Years of Experience *
                  </label>
                  <select
                    id="experience"
                    value={plannerProfile.experience}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setPlannerProfile((prev) => ({
                        ...prev,
                        experience: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
                    required
                  >
                    <option value="">Select experience level</option>
                    {experienceOptions.map((exp) => (
                      <option key={exp} value={exp}>
                        {exp}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block mb-2 text-gray-700"
                  >
                    Business Description
                  </label>
                  <textarea
                    id="description"
                    value={plannerProfile.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setPlannerProfile((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
                    placeholder="Tell clients about your services and approach..."
                    rows={3}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="pricing" className="block mb-2 text-gray-700">
                    Pricing Information
                  </label>
                  <textarea
                    id="pricing"
                    value={plannerProfile.pricing}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setPlannerProfile((prev) => ({
                        ...prev,
                        pricing: e.target.value,
                      }))
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-300 focus:border-primary-500 transition-colors"
                    placeholder="E.g., Starting at $2,000 for day-of coordination, $5,000 for full planning..."
                    rows={2}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white ${
                isSubmitting
                  ? "bg-primary-400 cursor-not-allowed"
                  : "bg-primary-500 hover:bg-primary-600"
              } transition-colors`}
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <button
              onClick={handleGuestMode}
              className="w-full py-3 px-4 rounded-lg bg-festive-yellow-100 text-festive-yellow-700 font-bold hover:bg-festive-yellow-200 transition-colors mb-4"
            >
              Continue as Guest
            </button>

            <p className="text-gray-600 mt-4">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary-600 hover:text-primary-800 font-medium"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      }
    />
  );
};

export default Register;
