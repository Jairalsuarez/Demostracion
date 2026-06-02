import { useState } from "react";
import { supabase, supabaseReady } from "../services/supabaseclient";
import { fetchRemoteWalletState, fetchRemoteSales } from "../services/operationsService";
import { fetchRemoteProducts } from "../services/productService";

export default function useSupabaseDebug() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const diagnostics = {
      supabaseReady,
      url: import.meta.env.VITE_SUPABASE_URL ? "Configurado" : "Falta URL",
      key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ? "Configurada" : "Falta KEY",
      tests: {}
    };

    if (!supabaseReady || !supabase) {
      diagnostics.error = "Supabase no está configurado";
      setResults(diagnostics);
      setLoading(false);
      return diagnostics;
    }

    // Test 1: Verificar sesión actual
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      diagnostics.session = {
        exists: !!session,
        userId: session?.user?.id || null,
        email: session?.user?.email || null,
        error: error?.message || null
      };
    } catch (e) {
      diagnostics.session = { error: e.message };
    }

    // Test 2: Probar RPC create_informal_sale con datos de prueba
    if (diagnostics.session?.exists) {
      try {
        const testPayload = {
          p_shift_id: null,
          p_user_id: diagnostics.session.userId,
          p_total: 1,
          p_description: "TEST_DEBUG",
          p_payment_method: "efectivo",
          p_payment_evidence_url: null,
          p_payment_evidence_name: null,
          p_created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase.rpc("create_informal_sale", testPayload);
        diagnostics.tests.create_informal_sale = {
          success: !error,
          data,
          error: error ? {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          } : null
        };
      } catch (e) {
        diagnostics.tests.create_informal_sale = { error: e.message };
      }

      // Test 3: Probar RPC create_sale_with_items
      try {
        const testPayload2 = {
          p_shift_id: null,
          p_user_id: diagnostics.session.userId,
          p_total: 1,
          p_payment_method: "efectivo",
          p_payment_evidence_url: null,
          p_payment_evidence_name: null,
          p_created_at: new Date().toISOString(),
          p_items: []
        };
        
        const { data, error } = await supabase.rpc("create_sale_with_items", testPayload2);
        diagnostics.tests.create_sale_with_items = {
          success: !error,
          data,
          error: error ? {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          } : null
        };
      } catch (e) {
        diagnostics.tests.create_sale_with_items = { error: e.message };
      }
    }

    // Test 4: Probar fetchRemoteWalletState
    try {
      const walletResult = await fetchRemoteWalletState();
      diagnostics.tests.wallet_state = {
        success: walletResult.ok,
        data: walletResult.wallet || null,
        error: walletResult.error || null
      };
    } catch (e) {
      diagnostics.tests.wallet_state = { error: e.message };
    }

    // Test 5: Probar fetchRemoteSales
    try {
      const salesResult = await fetchRemoteSales();
      diagnostics.tests.sales = {
        success: salesResult.ok,
        count: salesResult.sales?.length || 0,
        error: salesResult.error || null
      };
    } catch (e) {
      diagnostics.tests.sales = { error: e.message };
    }

    // Test 6: Probar fetchRemoteProducts
    try {
      const productsResult = await fetchRemoteProducts();
      diagnostics.tests.products = {
        success: productsResult.ok,
        count: productsResult.products?.length || 0,
        error: productsResult.error || null
      };
    } catch (e) {
      diagnostics.tests.products = { error: e.message };
    }

    // Test 7: Verificar funciones RPC existentes (usando una consulta SQL)
    try {
      const { data, error } = await supabase
        .from('information_schema.routines')
        .select('routine_name')
        .eq('routine_schema', 'public')
        .in('routine_name', ['create_sale_with_items', 'create_informal_sale']);
      
      diagnostics.tests.rpc_functions = {
        success: !error,
        functions: data?.map(r => r.routine_name) || [],
        error: error?.message || null
      };
    } catch (e) {
      diagnostics.tests.rpc_functions = { error: e.message };
    }

    setResults(diagnostics);
    setLoading(false);
    return diagnostics;
  };

  return { results, loading, runDiagnostics };
}
