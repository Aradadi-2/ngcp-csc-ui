import Vue from 'vue'
import {
    getPreferences,
    getPreferencesDefs,
    setPreference,
    removePreference
} from '../api/subscriber'

export default {
    namespaced: true,
    state: {
        subscriberPreferencesInitialized: false,
        subscriberPreferences: {},
        preferencesDefs: {}
    },
    getters: {
        subscriberId (state, getters, rootState, rootGetters) {
            return parseInt(rootGetters['user/getSubscriberId'])
        },
        musicOnHold (state) {
            return state.subscriberPreferences.music_on_hold
        },
        language (state) {
            return state.subscriberPreferences.language
        },
        defaultLanguage (state, getters) {
            const languages = getters.languages
            return languages && languages.find(lang => lang.default_val).label
        },
        languages (state) {
            return state.preferencesDefs
                .language?.enum_values?.map((lang) => {
                    return { value: lang.value, label: lang.label, default_val: lang.default_val }
                })
        }
    },
    mutations: {
        subscriberPreferencesSucceeded (state, res) {
            state.subscriberPreferences = res
            state.subscriberPreferencesInitialized = true
        },
        subscriberPreferencesUpdate (state, { field, value }) {
            Vue.set(state.subscriberPreferences, field, value)
        },
        preferencesDefsSucceeded (state, res) {
            state.preferencesDefs = res
        }
    },
    actions: {
        async loadSubscriberPreferencesAction (context) {
            const subscriberPreferences = await getPreferences(context.getters.subscriberId)
            context.commit('subscriberPreferencesSucceeded', subscriberPreferences)
        },
        async fieldUpdateAction (context, options) {
            await setPreference(context.getters.subscriberId, options.field, options.value)
            context.commit('subscriberPreferencesUpdate', {
                field: options.field,
                value: options.value
            })
        },
        async loadPreferencesDefsAction (context) {
            const preferencesDefs = await getPreferencesDefs()
            context.commit('preferencesDefsSucceeded', preferencesDefs)
        },
        async setMusicOnHold (context, value) {
            await context.dispatch('fieldUpdateAction', { field: 'music_on_hold', value })
        },
        async setLanguage (context, value) {
            const subscriberId = context.getters.subscriberId
            if (value) {
                await setPreference(subscriberId, 'language', value)
                context.commit('subscriberPreferencesUpdate', {
                    field: 'language',
                    value: value
                })
            } else {
                await removePreference(subscriberId, 'language')
                context.commit('subscriberPreferencesUpdate', {
                    field: 'language',
                    value: null
                })
            }
        }
    }
}
