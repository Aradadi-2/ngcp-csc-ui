'use strict';

import _ from 'lodash'
import Vue from 'vue'
import Vuex from 'vuex'
import CallBlockingModule from './call-blocking'
import CallForwardModule from './call-forward'
import CallModule, {errorVisibilityTimeout} from './call'
import ConversationsModule from './conversations'

import PbxModule from './pbx'
import PbxSeatsModule from './pbx-seats'
import PbxGroupsModule from './pbx-groups'
import PbxDevicesModule from './pbx-devices'
import PbxCallQueuesModule from './pbx-callqueues'
import PbxSoundSetsModule from './pbx-soundsets'

import ReminderModule from './reminder'
import SpeedDialModule from './speed-dial'
import UserModule from './user'
import CommunicationModule from './communication'
import VoiceboxModule from './voicebox'
import ConferenceModule from './conference'
import {
    i18n,
    getLanguageLabels
} from '../i18n';
import RtcEnginePlugin from "../plugins/rtc-engine";
import CallPlugin from "../plugins/call";
import ConferencePlugin from "../plugins/conference";

Vue.use(RtcEnginePlugin);
Vue.use(CallPlugin);
Vue.use(ConferencePlugin);
Vue.use(Vuex);

export const store = new Vuex.Store({
    modules: {
        callBlocking: CallBlockingModule,
        callForward: CallForwardModule,
        call: CallModule,
        conversations: ConversationsModule,
        reminder: ReminderModule,
        speedDial: SpeedDialModule,
        user: UserModule,
        communication: CommunicationModule,
        voicebox: VoiceboxModule,
        conference: ConferenceModule,
        pbx: PbxModule,
        pbxSeats: PbxSeatsModule,
        pbxGroups: PbxGroupsModule,
        pbxDevices: PbxDevicesModule,
        pbxCallQueues: PbxCallQueuesModule,
        pbxSoundSets: PbxSoundSetsModule

    },
    getters: {
        conferenceId(state) {
            return _.get(state, 'route.params.id', null);
        },
        conferenceUrl(state) {
            let id = _.get(state, 'route.params.id', null);id;
            return window.location.href;
        },
        hasConferenceId(state, getters) {
            return getters.conferenceId !== null && getters.conferenceId !== void(0);
        },
        pageTitle(state) {
            return _.get(state, 'route.meta.title', 'Not defined');
        },
        pageSubtitle(state) {
            return _.get(state, 'route.meta.subtitle', '');
        },
        isCallForward(state) {
            return _.startsWith(_.get(state, 'route.path', ''), '/user/call-forward');
        },
        isCallBlocking(state) {
            return _.startsWith(_.get(state, 'route.path', ''), '/user/call-blocking');
        },
        isPbxConfiguration(state) {
            return _.startsWith(_.get(state, 'route.path', ''), '/user/pbx-configuration');
        },
        isHome(state) {
            return _.get(state, 'route.path', '') === '/user/home';
        },
        title() {
            return i18n.t('title');
        }
    },
    plugins: [
        function rtcEngine(store) {
            Vue.$rtcEngine.onSipNetworkConnected(()=>{
                store.commit('call/enableCall');
            }).onSipNetworkDisconnected(()=>{
                store.commit('call/disableCall');
            }).onConferenceNetworkConnected(() => {
                store.commit('conference/enableConferencing');
            }).onConferenceNetworkDisconnected(() => {
                store.commit('conference/disableConferencing');
            });
        },
        function call(store) {
            Vue.$call.onIncoming(()=>{
                store.commit('call/incomingCall', {
                    number: Vue.$call.getNumber()
                });
            }).onRemoteMedia((remoteMediaStream)=>{
                store.commit('call/establishCall', remoteMediaStream);
            }).onEnded((reason)=>{
                Vue.$call.end();
                store.commit('call/endCall', reason);
                setTimeout(()=>{
                    store.commit('call/inputNumber');
                }, errorVisibilityTimeout);
            });
        },
        function conference(store) {
            Vue.$conference.onLeft((conference)=>{
                store.commit('conference/leftSuccessfully', conference);
            }).onConferenceParticipantJoined((participant)=>{
                store.commit('conference/participantJoined', participant);
            }).onConferenceParticipantLeft((participant)=>{
                store.commit('conference/participantLeft', participant);
            }).onConferenceEvent((event)=>{
                store.commit('conference/event', event);
            }).onConferenceMessage((message)=>{
                store.commit('conference/message', message);
            }).onConferenceFile((file)=>{
                store.commit('conference/file', file);
            }).onLocalMediaStreamEnded(()=>{
                store.commit('conference/disposeLocalMedia');
            });
        },
        function initI18n(store) {
            store.commit('user/setLanguageLabels', getLanguageLabels());
            store.commit('user/changeSessionLocaleSucceeded', i18n.locale);
        }
    ]
});
