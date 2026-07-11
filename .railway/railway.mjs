import { defineRailway, project, service } from "railway";

export default defineRailway(() => {
  const web = service("KRLE_website", {
    build: "npm run build",
    start: "npm run start",
    deploy: {
      preDeployCommand: [],
    },
  });

  return project("KRLE_website", {
    services: [web],
  });
});
