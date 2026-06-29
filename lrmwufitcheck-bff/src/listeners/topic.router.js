const fs = require("fs");
const path = require("path");

class TopicRouter {
  constructor() {
    this.map = new Map();
  }

  loadHandlers() {
    const root = path.join(process.cwd(), "src/listeners");

    const walk = (dir) => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const full = path.join(dir, item);
        const isDir = fs.statSync(full).isDirectory();

        if (isDir) {
          walk(full);
          continue;
        }

        if (
          !item.endsWith(".js") ||
          item == "index.js" ||
          item == "topic.router.js"
        )
          continue;

        const mod = require(full);

        if (!mod.topic || !mod.handle) {
          console.warn("⚠ Invalid handler module:", full);
          continue;
        }

        if (!this.map.has(mod.topic)) {
          this.map.set(mod.topic, []);
        }

        this.map.get(mod.topic).push(mod.handle);

        console.log(`🔗 Handler registered for topic <${mod.topic}> → ${full}`);
      }
    };

    walk(root);
  }

  getHandlers(topic) {
    return this.map.get(topic) || [];
  }

  getTopics() {
    return Array.from(this.map.keys());
  }
}

module.exports = { TopicRouter };
