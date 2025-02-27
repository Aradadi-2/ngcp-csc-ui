<template>
    <q-layout
        id="csc-layout-main"
        view="lHh LpR lFf"
        @resize="layoutResized"
    >
        <q-header
            id="csc-header-main"
            v-model="header"
            reveal
            class="bg-secondary"
        >
            <q-toolbar
                id="csc-header-toolbar-main"
            >
                <q-btn
                    v-if="isMobile"
                    flat
                    icon="menu"
                    color="primary"
                    @click="$refs.mainMenu.show()"
                />
                <q-btn
                    v-if="hasFaxCapabilityAndFaxActive && hasSendFaxFeature"
                    class="q-mr-sm"
                    flat
                    dense
                    icon="apps"
                    color="primary"
                >
                    <csc-popup-menu>
                        <csc-popup-menu-item
                            icon="description"
                            color="primary"
                            :label="$t('Send Fax')"
                            @click="showSendFax()"
                        />
                    </csc-popup-menu>
                </q-btn>
                <csc-selection-language
                    v-if="!isMobile"
                />
                <q-btn
                    icon="person"
                    color="primary"
                    small
                    flat
                    dense
                    :label="getUsername"
                >
                    <q-menu>
                        <csc-user-menu
                            :username="getUsername"
                        />
                    </q-menu>
                </q-btn>
                <q-btn
                    v-if="showQrBtn"
                    flat
                    dense
                    class="q-ml-sm"
                    icon="qr_code"
                    color="primary"
                    data-cy="qr-code-btn"
                    @click="showQrDialog"
                />
                <q-space />
                <csc-logo
                    v-if="isLogoRequested && !customLogo"
                    id="csc-default-logo"
                    color="light"
                />
                <csc-custom-logo
                    v-else-if="isLogoRequested && customLogo"
                    id="csc-custom-logo"
                    :logo-data="customLogo"
                />
            </q-toolbar>
            <q-toolbar
                v-if="menuMinimized"
                inset
            >
                <q-item
                    class="bg-secondary q-pa-none"
                >
                    <q-item-section>
                        <q-item-label
                            class="text-h6"
                        >
                            {{ route.meta.title }}
                        </q-item-label>
                        <q-item-label
                            v-if="route.meta.subtitle"
                            class="text-subtitle2"
                        >
                            {{ route.meta.subtitle }}
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </q-toolbar>
        </q-header>
        <q-drawer
            id="csc-drawer-left"
            ref="mainMenu"
            v-model="menuClosed"
            :mini="menuMinimized"
            content-class="bg-main-menu"
            :behavior="drawerBehavior"
            show-if-above
            :width="280"
            @mouseleave="minimizeMenu"
            @mouseenter="maximizeMenu"
            @on-layout="layoutResized"
        >
            <div
                v-if="$q.platform.is.desktop"
                :class="pinMenuButtonClasses"
            >
                <div
                    class="col col-auto"
                >
                    <q-btn
                        v-if="!menuMinimized"
                        :icon="pinMenuButtonIcon"
                        color="white"
                        flat
                        dense
                        round
                        @click="pinMenu"
                    />
                </div>
            </div>
            <csc-selection-language-mobile
                v-if="$q.platform.is.mobile"
                id="csc-language-menu-main-mobile"
                class="csc-language-menu"
            />
            <csc-main-menu-top
                id="csc-main-menu-top"
                class="csc-main-menu no-margin"
                :call-state-title="callStateTitle"
                :call-state-subtitle="callStateSubtitle"
                :is-call-forward="isCallForward"
                :is-call-blocking="isCallBlocking"
                :is-pbx-admin="isPbxAdmin"
                :is-pbx-configuration="isPbxConfiguration"
            />
            <aui-mobile-app-badges />
        </q-drawer>
        <q-page-container
            id="csc-page-main"
        >
            <router-view />
        </q-page-container>
        <csc-send-fax
            v-model="faxDialog"
        />
        <csc-call
            id="csc-call"
            ref="call"
            :call-state="callState"
            :call-number="callNumber"
            :ended-reason="endedReason"
            :full-view="isFullView"
            :minimized="!isHome && !isMaximized"
            :maximizable="!isHome"
            :closed="!isCalling && !isHome"
            :local-media-stream="localMediaStream"
            :remote-media-stream="remoteMediaStream"
            :is-video-call="hasVideo"
            :has-local-video="hasLocalVideo"
            :has-remote-video="hasRemoteVideo"
            :microphone-enabled="isMicrophoneEnabled"
            :camera-enabled="isCameraEnabled"
            :screen-enabled="isScreenEnabled"
            :remote-volume-enabled="isRemoteVolumeEnabled"
            :dialpad-opened="isDialpadOpened"
            :menu-minimized="menuMinimized"
            @start-call="startCall"
            @accept-call="acceptCall"
            @end-call="endCall"
            @close-call="closeCall"
            @toggle-microphone="toggleMicrophone"
            @toggle-camera="toggleCamera"
            @toggle-screen="toggleScreen"
            @toggle-remote-volume="toggleRemoteAudio"
            @click-dialpad="clickDialpad"
            @toggle-dialpad="toggleDialpad"
            @maximize-call="maximizeCall"
            @minimize-call="minimizeCall"
            @add-camera="toggleCamera"
        />
    </q-layout>
</template>

<script>
import { colors } from 'quasar'
import platformMixin from '../mixins/platform'
import {
    startLoading,
    stopLoading,
    showToast,
    showGlobalError,
    enableIncomingCallNotifications
} from 'src/helpers/ui'
import {
    mapGetters,
    mapActions,
    mapState
} from 'vuex'
import CscCall from 'components/call/CscCall'
import CscSendFax from 'components/CscSendFax'
import CscLogo from 'components/CscLogo'
import CscCustomLogo from 'components/CscCustomLogo'
import CscUserMenu from 'components/CscUserMenu'
import CscMainMenuTop from 'components/CscMainMenuTop'
import CscPopupMenu from 'components/CscPopupMenu'
import CscPopupMenuItem from 'components/CscPopupMenuItem'
import AuiMobileAppBadges from 'components/AuiMobileAppBadges'
import CscDialogQrCode from 'components/CscDialogQrCode'
import CscSelectionLanguage from 'components/CscSelectionLanguage'
import CscSelectionLanguageMobile from 'components/CscSelectionLanguageMobile'

export default {
    name: 'CscMainLayout',
    components: {
        CscSelectionLanguage,
        CscSelectionLanguageMobile,
        AuiMobileAppBadges,
        CscPopupMenuItem,
        CscPopupMenu,
        CscMainMenuTop,
        CscCall,
        CscSendFax,
        CscLogo,
        CscCustomLogo,
        CscUserMenu
    },
    mixins: [
        platformMixin
    ],
    data () {
        return {
            header: true,
            menuClosed: false,
            menuPinned: true,
            menuMinimized: false,
            sideStates: {
                left: true,
                right: false
            },
            mobileMenu: null,
            faxDialog: false,
            customLogo: null
        }
    },
    computed: {
        ...mapState([
            'route'
        ]),
        ...mapGetters([
            'isCallForward',
            'isCallBlocking',
            'isPbxConfiguration',
            'isHome'
        ]),
        ...mapGetters('call', [
            'isCallEnabled',
            'callState',
            'callNumber',
            'callNumberInput',
            'endedReason',
            'isCalling',
            'localMediaStream',
            'remoteMediaStream',
            'hasVideo',
            'hasLocalVideo',
            'hasRemoteVideo',
            'isMicrophoneEnabled',
            'isCameraEnabled',
            'isScreenEnabled',
            'isRemoteVolumeEnabled',
            'isMaximized',
            'isDialpadOpened',
            'callStateTitle',
            'callStateSubtitle'
        ]),
        ...mapGetters('conference', [
            'isConferencingEnabled'
        ]),
        ...mapGetters('user', [
            'isLogged',
            'hasUser',
            'getUsername',
            'isPbxAdmin',
            'hasSmsCapability',
            'hasFaxCapabilityAndFaxActive',
            'hasSendSmsFeature',
            'hasSendFaxFeature',
            'userDataRequesting',
            'userDataSucceeded',
            'isRtcEngineUiVisible',
            'isLogoRequesting',
            'isLogoRequested'
        ]),
        ...mapState('user', [
            'resellerBranding',
            'defaultBranding',
            'platformInfo'
        ]),
        ...mapGetters('communication', [
            'createFaxState',
            'createFaxError'
        ]),
        showQrBtn () {
            return this.platformInfo?.app?.show_qr
        },
        hasCommunicationCapabilities () {
            return (this.hasSmsCapability && this.hasSendSmsFeature) ||
                (this.hasFaxCapabilityAndFaxActive && this.hasSendFaxFeature)
        },
        isMenuClosed () {
            return !this.sideStates.left
        },
        isFullView () {
            return this.isMenuClosed || this.isMobile || this.mobileMenu
        },
        layoutClasses () {
            const classes = []
            if (this.isCalling) {
                classes.push('csc-layout-call-active')
            }
            if (this.menuMinimized) {
                classes.push('csc-menu-minimized')
            }
            return classes
        },
        headerClasses () {
            const classes = ['transition-generic']
            if (this.isMobile) {
                classes.push('csc-header-mobile')
            }
            if (this.isMobile || this.isMenuClosed) {
                classes.push('csc-header-full')
            }
            return classes
        },
        pinMenuButtonIcon () {
            if (!this.menuPinned) {
                return 'push_pin'
            } else {
                return 'arrow_left'
            }
        },
        pinMenuButtonClasses () {
            const classes = ['pin-menu-button row items-center']
            if (!this.menuMinimized) {
                classes.push('justify-end')
                classes.push('q-pl-sm q-pr-sm')
            } else {
                classes.push('justify-center')
            }
            return classes
        },
        drawerBehavior () {
            if (this.$q.platform.is.mobile) {
                return 'mobile'
            } else {
                return 'desktop'
            }
        }
    },
    watch: {
        callState (state) {
            if (state === 'established') {
                this.menuPinned = false
                this.menuMinimized = true
                this.header = true
            } else {
                this.header = true
            }
        },
        isHome (isHome) {
            if (isHome) {
                this.$store.commit('call/minimize')
            }
        },
        userDataSucceeded (userDataSucceeded) {
            if (userDataSucceeded) {
                enableIncomingCallNotifications()

                this.updateBrandings()
            }
        },
        isCallEnabled (value) {
            if (value && this.isRtcEngineUiVisible) {
                showToast(this.$i18n.t('You are now able to start and receive calls'))
            }
        },
        createFaxState (state) {
            if (state === 'requesting') {
                startLoading()
            } else if (state === 'failed') {
                stopLoading()
                showGlobalError(this.createFaxError)
            } else if (state === 'succeeded') {
                stopLoading()
                showToast(this.$t('Sending fax completed successfully.'))
                this.hideSendFax()
            }
        },
        $route (route) {
            if (!this.isHome) {
                this.$store.commit('call/minimize')
            }
            if (this.$refs.call) {
                this.$nextTick(() => {
                    this.$refs.call.fitMedia()
                })
            }
            window.scrollTo(0, 0)
            if (route.path === '/user/dashboard') {
                this.forwardHome()
            }
        }
    },
    async mounted () {
        window.addEventListener('orientationchange', () => {
            this.$root.$emit('orientation-changed')
        })
        window.addEventListener('resize', () => {
            this.$root.$emit('window-resized')
        })
        this.updateBrandings()
        this.customLogo = await this.$store.dispatch('user/getCustomLogo')
    },
    methods: {
        ...mapActions('user', [
            'forwardHome',
            'fetchAuthToken'
        ]),
        ...mapActions('call', [
            'toggleCamera',
            'toggleScreen',
            'toggleMicrophone',
            'toggleRemoteAudio'
        ]),
        layoutResized () {
            this.$refs.call.fitMedia()
        },
        pinMenu () {
            this.menuPinned = !this.menuPinned
            if (this.menuPinned === false) {
                this.menuMinimized = true
            }
        },
        minimizeMenu () {
            if (!this.menuPinned) {
                this.menuMinimized = true
            }
            this.layoutResized()
        },
        maximizeMenu () {
            if (!this.menuPinned) {
                this.menuMinimized = false
            }
            this.layoutResized()
        },
        showSendFax () {
            this.faxDialog = true
        },
        hideSendFax () {
            this.faxDialog = false
        },
        startCall (localMedia) {
            if (this.callNumberInput !== '' && this.callNumberInput !== null) {
                this.$store.dispatch('call/start', localMedia)
            }
        },
        acceptCall (localMedia) {
            this.$store.dispatch('call/accept', localMedia)
        },
        closeCall () {
            this.$store.commit('call/inputNumber')
        },
        endCall () {
            this.$store.dispatch('call/end')
        },
        clickDialpad (value) {
            this.$store.dispatch('call/sendDTMF', value)
        },
        toggleDialpad () {
            this.$store.commit('call/toggleDialpad')
        },
        maximizeCall () {
            if (this.isMobile) {
                this.$router.push({ path: '/user/home' })
            } else {
                this.$store.commit('call/maximize')
            }
        },
        minimizeCall () {
            this.$store.commit('call/minimize')
        },
        leftBreakpoint (enabled) {
            this.mobileMenu = !enabled
        },
        toggleMenu () {
            this.menuMinimized = !this.menuMinimized
        },
        sideStateLeft () {
            return this.sideStates.left
        },
        updateBrandings () {
            const primaryColor = this.resellerBranding?.csc_color_primary || this.defaultBranding?.primaryColor
            const secondaryColor = this.resellerBranding?.csc_color_secondary || this.defaultBranding?.secondaryColor
            if (primaryColor) {
                colors.setBrand('primary', primaryColor)
            }
            if (secondaryColor) {
                colors.setBrand('secondary', secondaryColor)
            }
            let customCss = document.getElementById('csc-custom-css')
            if (!customCss && this.resellerBranding?.css) {
                customCss = document.createElement('style')
                customCss.id = 'csc-custom-css'
                customCss.textContent = this.resellerBranding.css
                document.body.appendChild(customCss)
            }
        },
        async showQrDialog () {
            await this.fetchAuthToken()
            this.$q.dialog({
                component: CscDialogQrCode,
                parent: this
            })
        }
    }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
    .app-badge
        width: 60% !important

    .pin-menu-button
        height: $header-height
    #csc-header-toolbar
        background-color $secondary
    #csc-main-logo
        height 52px
        width auto
        right 12px
        top 4px
        position absolute
    .csc-user-menu-button
        margin-left 0
        margin-right 0.2rem
        padding 0.2rem
        .on-left
            margin 0
        .csc-username
            padding-left 3px
            font-weight normal
            color rgba(255,255,255,0.6)
    .page.page-call-active
        padding-bottom 120px
    #main-menu
        padding 0
        .q-item
            padding-top $flex-gutter-xs * 1.4
            padding-bottom  $flex-gutter-xs * 1.4
            .q-item-side-left
                min-width auto
            .q-item-main
                margin-left $flex-gutter-sm
            .q-icon
                color $main-menu-icon-color
            .q-item-label
                color $main-menu-title-color
                font-weight bold
                white-space nowrap
            .q-item-sublabel
                color $main-menu-subtitle-color
        .q-item:hover
            background-color $main-menu-item-hover-background
        .q-item.router-link-active
            .q-icon
                color $main-menu-icon-active-color
            .q-item-label
                color $main-menu-title-active-color
                font-weight bold
            .q-item-sublabel
                color $main-menu-subtitle-active-color
            background-color transparent
    #user-login-as
        display inline-block
        text-transform none
    #user-login-as:after
        content " "
        white-space pre
    #user-name
        font-weight bold
    .q-card
        margin 15px
        margin-left 0
        margin-right 0
    .q-card.page
        padding 0
        margin 0
    .q-if-control.q-if-control-before.q-icon,
    .q-if-control.q-if-control-before.q-icon:before
        font-size 24px
    .csc-toolbar-btn-popover
        .q-item-main.q-item-section
            margin-left 0
    .q-toolbar
        .csc-toolbar-btn.q-btn
            padding-left 8px
            padding-right 8px
        .csc-toolbar-btn-right
            .csc-toolbar-btn-icon
                margin-right 8px
    .csc-layout-call-active
        padding-bottom 152px
    #csc-header
        position fixed
        top 0
        left $layout-aside-left-width
        right 0
        height $header-height
        overflow hidden
        z-index 100
        background-color $secondary
        .csc-header-content
            position absolute
            top 0
            right 0
            left 0
            bottom 0
            padding $logo-margin
            background linear-gradient(to bottom, rgba(21,29,48,0.5) 0%,rgba(21,29,48,0) 75%,rgba(21,29,48,0) 100%)
    #csc-header.csc-header-full
        left 0
    #csc-user-menu
        cursor pointer
        display inline-block
        .csc-username
            padding-left 4px
    .csc-toggle-menu
        cursor pointer
        position absolute
        top $logo-margin
        right $logo-margin
        display flex
        justify-content center
        align-items center
        width 40px
        height 40px
        .q-icon
            display flex
            position relative
            font-size 24px
    .layout-aside-left
        padding-top $header-height
    .csc-menu-minimized
        .layout-aside-left
            width $main-menu-minimized-width
            .q-item-main
                display none
        .csc-toggle-menu
            width $main-menu-minimized-width
            left 0
        #main-menu
            .q-collapsible
                .q-collapsible-sub-item
                    padding 0
        #csc-header
            left $main-menu-minimized-width
    .mobile
        .layout-aside-left
            width auto
            right 0
    .csc-subitem-label
        padding-left 20px
    .csc-toolbar-btn-popover
        .q-collapsible-sub-item
            padding 0 16px 0 16px
    .csc-collapsible-menu
        .q-icon
            display none
    #csc-default-logo
            height 48px
    #csc-custom-logo
            min-width $logo-min-width
            max-width $logo-max-width
            max-height $logo-max-height
</style>
