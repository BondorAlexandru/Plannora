declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: 'portrait' | 'landscape';
    };
  }

  function html2pdf(): {
    set(opt: Html2PdfOptions): any;
    from(element: HTMLElement | string): any;
    save(): Promise<void>;
  };
  
  export = html2pdf;
} 