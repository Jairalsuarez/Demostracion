import { useEffect } from "react";
import { supabase, supabaseReady } from "../services/supabaseclient";
import { refreshSupabaseSession } from "../services/authService.js";
import {
  fetchRemoteDistributors,
  fetchRemoteExpenseCategories,
  fetchRemoteExpenses,
  fetchRemoteCommunityFeedback,
  fetchRemoteCashState,
  fetchRemoteNotifications,
  fetchRemoteSales,
  fetchRemoteSchedules,
  fetchRemoteShifts,
  fetchRemoteWalletState,
} from "../services/operationsService.js";
import { fetchRemoteProducts } from "../services/productService.js";
import { fetchRemoteProfiles, mergeUsers } from "../services/profileService.js";

const getTimestamp = (value) => {
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) ? time : 0;
};

export default function useSupabaseSync(session, setSession, commit, setSyncing, onSynced) {
  const syncRemoteData = async () => {
    if (!supabaseReady || !supabase) return;

    try {
      if (session?.mode !== "supabase") {
        const [productsResult, feedbackResult] = await Promise.all([fetchRemoteProducts(), fetchRemoteCommunityFeedback()]);

        commit((current) => ({
          ...current,
          products: productsResult.ok ? productsResult.products : current.products,
          communityFeedbacks: feedbackResult.ok ? feedbackResult.feedbacks : current.communityFeedbacks,
        }));

        return;
      }

      setSyncing(true);

      const [productsResult, shiftsResult, walletResult, cashResult, schedulesResult, salesResult, expensesResult, distributorsResult, categoriesResult, profilesResult, notificationsResult, feedbackResult] = await Promise.all([
        fetchRemoteProducts(),
        fetchRemoteShifts(),
        fetchRemoteWalletState(),
        fetchRemoteCashState(),
        fetchRemoteSchedules(),
        fetchRemoteSales(),
        fetchRemoteExpenses(),
        fetchRemoteDistributors(),
        fetchRemoteExpenseCategories(),
        fetchRemoteProfiles(),
        fetchRemoteNotifications(),
        fetchRemoteCommunityFeedback(),
      ]);

      commit((current) => {
        return {
          ...current,
          products: productsResult.ok ? productsResult.products : current.products,
          turnos: shiftsResult.ok ? shiftsResult.shifts : current.turnos,
          wallet: walletResult.ok ? walletResult.wallet : current.wallet,
          cashBox: cashResult.ok ? cashResult.cashBox : current.cashBox,
          schedules: schedulesResult.ok ? schedulesResult.schedules : current.schedules,
          sales: salesResult.ok ? salesResult.sales : current.sales,
          expenses: expensesResult.ok ? expensesResult.expenses : current.expenses,
          distributors: distributorsResult.ok ? distributorsResult.distributors : current.distributors,
          expenseCategories: categoriesResult.ok ? categoriesResult.categories : current.expenseCategories,
          users: profilesResult.ok ? mergeUsers(current.users, profilesResult.profiles) : current.users,
          notifications: notificationsResult.ok ? notificationsResult.notifications : current.notifications,
          communityFeedbacks: feedbackResult.ok ? feedbackResult.feedbacks : current.communityFeedbacks,
        };
      });
      onSynced?.(session);
    } catch (error) {
      console.error("Error syncing data:", error);
      if (session?.mode === "supabase") {
        onSynced?.(session);
      }
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    let off = false;
    (async () => {
      if (session?.mode !== "supabase") return;
      const refreshed = await refreshSupabaseSession(session);
      if (!off && refreshed.ok) setSession(refreshed.session);
    })();
    return () => {
      off = true;
    };
  }, [session, setSession]);

  useEffect(() => {
    syncRemoteData();
  }, [session?.mode]);

  useEffect(() => {
    if (!supabaseReady || !supabase) return undefined;

    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, syncRemoteData)
      .on("postgres_changes", { event: "*", schema: "public", table: "community_feedback" }, syncRemoteData)
      .on("postgres_changes", { event: "*", schema: "public", table: "sales" }, syncRemoteData)
      .on("postgres_changes", { event: "*", schema: "public", table: "expenses" }, syncRemoteData)
      .on("postgres_changes", { event: "*", schema: "public", table: "distributors" }, syncRemoteData)
      .on("postgres_changes", { event: "*", schema: "public", table: "expense_categories" }, syncRemoteData)
      .on("postgres_changes", { event: "*", schema: "public", table: "shifts" }, syncRemoteData)
      .on("postgres_changes", { event: "*", schema: "public", table: "wallet_state" }, syncRemoteData)
      .on("postgres_changes", { event: "*", schema: "public", table: "cash_state" }, syncRemoteData)
      .on("postgres_changes", { event: "*", schema: "public", table: "schedules" }, syncRemoteData)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, syncRemoteData)
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, syncRemoteData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.mode]);

  return { syncRemoteData };
}
