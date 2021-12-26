const logger = require("../utils/logger");
const config = require("../config");
const fs = require("fs");
const path = require("path")
let useDevSettings = false;
if(config.envName === "development" && fs.existsSync(path.join(__dirname, "../config/settings.development.js"))) {
  useDevSettings = true;
}
const settings = useDevSettings ? require("../config/settings.development") : require("../config/settings");
const User = require("../db/models/user");
const VerificationRequest = require("../db/models/verificationRequest");

class StatsController {
  constructor() {
    let verificationConfig = settings.rules.find(r => r.name === "Crypto Zombies Verifier");
    this.roleConfiguration = verificationConfig.executor.config.roles;
  }
  async getTotal(req, res) {
    const result = await User.count().exec();
    res
      .status(200)
      .json({
        count: result,
      })
      .end();
  }

  async getTheHoarde(req, res) {
    let roleId = this.roleConfiguration.find(r => r.name === "The Hoarde").id;
    const result = await User.count({
      status: { $elemMatch: { roleId: roleId, qualified: true } },
    });
    res
      .status(200)
      .json({
        count: result,
      })
      .end();
  }

  async getOrcaz(req, res) {
    let roleId = this.roleConfiguration.find(r => r.name === "Zombie Orcaz").id;
    const result = await User.count({
      status: { $elemMatch: { roleId: roleId, qualified: true } },
    });
    res
      .status(200)
      .json({
        count: result,
      })
      .end();
  }

  async getWhalez(req, res) {
    let roleId = this.roleConfiguration.find(r => r.name === "Zombie Whalez").id;
    const result = await User.count({
      status: { $elemMatch: { roleId: roleId, qualified: true } },
    });
    res
      .status(200)
      .json({
        count: result,
      })
      .end();
  }

  async getKrakenz(req, res) {
    let roleId = this.roleConfiguration.find(r => r.name === "Zombie Krakenz").id;
    const result = await User.count({
      status: { $elemMatch: { roleId: roleId, qualified: true } },
    });
    res
      .status(200)
      .json({
        count: result,
      })
      .end();
  }

  async getVerifications(req, res) {
    const result = await VerificationRequest.count({});
    res
      .status(200)
      .json({
        count: result,
      })
      .end();
  }
}

module.exports = new StatsController();
