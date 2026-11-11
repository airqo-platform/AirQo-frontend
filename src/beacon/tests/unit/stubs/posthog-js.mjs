// Stand-in for posthog-js in the unit tests: records what lib/analytics.ts asks of PostHog.
// Tests import "posthog-js" to get this same object, then inspect or steer it.
const posthog = {
  initCalls: 0,
  failingInits: 0,
  captured: [],
  identified: [],
  distinctId: "anonymous",
  userState: "anonymous",

  /** Makes the next init() throw, as a blocked or failed load would. */
  failNextInit() {
    this.failingInits += 1
  },

  init() {
    this.initCalls += 1
    if (this.failingInits > 0) {
      this.failingInits -= 1
      throw new Error("PostHog failed to load")
    }
  },
  capture(event, properties, options) {
    this.captured.push({ event, properties, options })
  },
  identify(id, properties) {
    this.identified.push({ id, properties })
    this.distinctId = id
    this.userState = "identified"
  },
  setPersonProperties() {},
  reset() {
    this.distinctId = "anonymous"
    this.userState = "anonymous"
  },
  group() {},
  resetGroups() {},
  get_distinct_id() {
    return this.distinctId
  },
  get_property(key) {
    return key === "$user_state" ? this.userState : undefined
  },
}

export default posthog
