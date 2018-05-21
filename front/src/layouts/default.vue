<template>
  <div>
    <q-tabs color="grey" v-model="selTab">
      <div slot="title" class="flex row inline items-center" style="padding-right: 30px; font-size: 120%;">Landix</div>
      <q-tab
        slot="title"
        :class="{'text-black': selTab !== 'dashboard', 'bg-dark': selTab === 'dashboard'}"
        name="dashboard"
        label="Dashboard"
        @click="$router.push('/dashboard')"
      />
      <q-tab
        default
        slot="title"
        :class="{'text-black': selTab !== 'tabela', 'bg-dark': selTab === 'tabela'}"
        name="tabela"
        label="Tabela"
        @click="$router.push('/')"
      />
    </q-tabs>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'LayoutDefault',
  data () {
    return {
      selTab: 'tabela'
    }
  }
}
</script>

<style>
</style>
