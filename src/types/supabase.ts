export type Database = {
  public: {
    Tables: {
      analyses: {
        Row: {
          id: string;
          source_title: string | null;
          overall_risk: "low" | "medium" | "high" | null;
          summary: string | null;
          red_flags: unknown[] | null;
          recommendations: string[] | null;
          deal_parties: string[] | null;
          companies_involved: string[] | null;
          deal_room: string | null;
          playbook: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_title?: string | null;
          overall_risk?: "low" | "medium" | "high" | null;
          summary?: string | null;
          red_flags?: unknown[] | null;
          recommendations?: string[] | null;
          deal_parties?: string[] | null;
          companies_involved?: string[] | null;
          deal_room?: string | null;
          playbook?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["analyses"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
