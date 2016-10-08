import { compose } from 'redux'

const insertRules = ({ rules = [] }) => {
  const verifiedRules = rules.filter(verifyStructure)

  return store => next => action => {
    const { getState } = store
    const truthyReactions = rules
      .filter(byActionType(action.type))
      .filter(byTruthyCondition({ state: getState(), action }))
      .map(rule => rule.reaction)

    if (truthyReactions.length === 0) return next(action)

    return compose(...truthyReactions)(store)(next)(action)
  }
}

const verifyStructure = rule => {
  const { type, condition, actionTypes, reaction } = rule

  // @TODO: Should be better ways of doing schema check.
  const result = (typeof type === 'string') &&
    Array.isArray(actionTypes) &&
    (typeof condition === 'function') &&
    (typeof reaction === 'function')

  if (result === false) {
    throw new TypeError('Rule  "' + type + '" miss a property.')
  }

  return result
}

export const byTruthyCondition = facts => rule => rule.condition(facts)

export const byActionType = actionType => rule => rule.actionTypes
  .some(type => type === actionType)

export const createOperators = facts => ({
  every (conditions) {
    return conditions.every(condition => condition(facts))
  },
  some (conditions) {
    return conditions.some(condition => condition(facts))
  }
})

export default insertRules
