import { Epic } from "epic-framework";
import path from "path";

/**
 * ------------------------------------------------------
 * Application Routes
 * ------------------------------------------------------
 */

// Load Controllers
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Controllers = require(path.join("../controllers", path.basename(__filename)));

export class indexRoutes {

}

module.exports = (epic: Epic) => {

    // Chaned Routes
    epic.route()
        // Default Homepage
        .get('/', Controllers.home)
};