import { createConsumer } from "@rails/actioncable"
import appConfig from "../config/applicationConfiguration";

export default createConsumer(appConfig.wsUrl)