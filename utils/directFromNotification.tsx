import type { Router } from "expo-router";

function directToInvite(router: Router) {
  router.push("/(noti)/invite");
}

function directToTeam(router: Router, id: string) {
  router.push({
    pathname: "/(team)/teamInfo",
    params: { id },
  });
}

function directToChat(router: Router, id: string) {
  router.push({
    pathname: "/(team)/chat",
    params: { id },
  });
}

function directToPlan(router: Router, id: string) {
  router.push({
    pathname: "/(team)/plan/planDetail",
    params: { id },
  });
}
