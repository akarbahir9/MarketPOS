export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          created_at: string
          id: string
          loan_balance: number
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          loan_balance?: number
          name: string
          phone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          loan_balance?: number
          name?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          description: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          price: number
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          id?: string
          invoice_id: string
          price: number
          product_id: string
          quantity: number
          user_id: string
        }
        Update: {
          id?: string
          invoice_id?: string
          price?: number
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          total_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          total_amount: number
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"]
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          buy_price: number
          created_at: string
          id: string
          name: string
          sell_price: number
          stock: number
          user_id: string
        }
        Insert: {
          barcode?: string | null
          buy_price: number
          created_at?: string
          id?: string
          name: string
          sell_price: number
          stock?: number
          user_id: string
        }
        Update: {
          barcode?: string | null
          buy_price?: number
          created_at?: string
          id?: string
          name?: string
          sell_price?: number
          stock?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          username: string
        }
        Insert: {
          created_at?: string
          id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_total_customers: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      get_total_expenses: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      get_total_products: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      get_total_sales: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      get_user_email_from_username: {
        Args: {
          p_username: string
        }
        Returns: string
      }
    }
    Enums: {
      payment_status: "paid" | "pending" | "partial"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
