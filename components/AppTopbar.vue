<script setup>
const { onMenuToggle, toggleDarkMode, isDarkTheme } = useLayout();
const { clear } = useUserSession();

const userMenu = ref()

const toggleUserMenu = (event) => {
    userMenu.value.toggle(event)
}
function logout() {
    clear()
    nextTick(() => navigateTo('/login'))
}
const items = ref([
    {
        items: [
            {
                label: 'Profile',
                icon: 'pi pi-user',
                command: () => navigateTo('/user/profile')
            },
            {
                label: 'Logout',
                icon: 'pi pi-sign-out',
                command: () => logout()
            }
        ]
    }
])
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" @click="onMenuToggle">
                <i class="pi pi-bars"></i>
            </button>
            <div class="font-semibold text-xl">SGE LIMS</div>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
            </div>

            <button type="button" class="layout-topbar-action" @click="toggleUserMenu" >
                <i class="pi pi-user"></i>
            </button>
            <Menu ref="userMenu" :model="items" :popup="true" />
            <!-- <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button> -->

            <!-- <div class="layout-topbar-menu hidden">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action" @click="logout">
                        <i class="pi pi-user"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div> -->
        </div>
    </div>
</template>
