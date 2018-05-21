<template>
  <div style="padding: 20px;">
    <div class="flex row">
      <div class="col-4">
        <b>Agrupamento:</b>
        <div class="flex row">
          <div class="col-auto">
            <q-checkbox class="filterCkbx" v-model="ckbs.Cliente" label="Cliente" />
          </div>
          <div class="col-auto">
            <q-checkbox class="filterCkbx" v-model="ckbs.Produto" label="Produto" />
          </div>
          <div class="col-auto">
            <q-checkbox class="filterCkbx" v-model="ckbs.Marca" label="Marca" />
          </div>
          <div class="col-auto">
            <q-checkbox class="filterCkbx" v-model="ckbs.Modelo" label="Modelo" />
          </div>
          <div class="col-auto">
            <q-checkbox class="filterCkbx" v-model="ckbs.Memoria" label="Memória" />
          </div>
          <div class="col-auto">
            <q-checkbox class="filterCkbx" v-model="ckbs.SO" label="SO" />
          </div>
          <div class="col-auto">
            <q-checkbox class="filterCkbx" v-model="ckbs.VersaoSO" label="Versão SO" />
          </div>
        </div>
      </div>
      <div class="col">
        <b>Filtros:</b>
        <div class="flex row">
          <div class="col-auto">
            <q-select class="filterCombo" multiple toggle :filter="true" float-label="Cliente" v-model="cmbs.Cliente" :options="opts.Cliente" />
          </div>
          <div class="col-auto">
            <q-select class="filterCombo" multiple toggle :filter="true" float-label="Produto" v-model="cmbs.Produto" :options="opts.Produto" />
          </div>
          <div class="col-auto">
            <q-select class="filterCombo" multiple toggle :filter="true" float-label="Marca" v-model="cmbs.Marca" :options="opts.Marca" />
          </div>
          <div class="col-auto">
            <q-select class="filterCombo" multiple toggle :filter="true" float-label="Modelo" v-model="cmbs.Modelo" :options="opts.Modelo" />
          </div>
          <div class="col-auto">
            <q-select class="filterCombo" multiple toggle :filter="true" float-label="Memória" v-model="cmbs.Memoria" :options="opts.Memoria" />
          </div>
          <div class="col-auto">
            <q-select class="filterCombo" multiple toggle :filter="true" float-label="SO" v-model="cmbs.SO" :options="opts.SO" />
          </div>
          <div class="col-auto">
            <q-select class="filterCombo" multiple toggle :filter="true" float-label="Versão SO" v-model="cmbs.VersaoSO" :options="opts.VersaoSO" />
          </div>
        </div>
      </div>
      <div class="col-auto row inline items-end">
        <q-btn style="margin-right: 10px;" color="blue" @click="filtrar()">Filtrar</q-btn>
        <q-btn style="margin-right: 10px;" color="red" @click="limpar()">Limpar</q-btn>
      </div>
    </div>
    <div style="padding-top: 20px;">
      <table class="q-table cell-separator" v-if="rows.length > 0">
        <thead>
          <tr>
            <th v-if="cols.Cliente" class="text-left">Cliente</th>
            <th v-if="cols.Produto" class="text-left">Produto</th>
            <th v-if="cols.Marca" class="text-left">Marca</th>
            <th v-if="cols.Modelo" class="text-left">Modelo</th>
            <th v-if="cols.Memoria" class="text-left">Memoria</th>
            <th v-if="cols.SO" class="text-left">SO</th>
            <th v-if="cols.VersaoSO" class="text-left">VersaoSO</th>
            <th class="text-left">Quantidade</th>
            <th class="text-left">%/Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="index">
            <td v-if="cols.Cliente" class="text-left">{{ row.Cliente }}</td>
            <td v-if="cols.Produto" class="text-left">{{ row.Produto }}</td>
            <td v-if="cols.Marca" class="text-left">{{ row.Marca }}</td>
            <td v-if="cols.Modelo" class="text-left">{{ row.Modelo }}</td>
            <td v-if="cols.Memoria" class="text-left">{{ row.Memoria }}</td>
            <td v-if="cols.SO" class="text-left">{{ row.SO }}</td>
            <td v-if="cols.VersaoSO" class="text-left">{{ row.VersaoSO }}</td>
            <td class="text-left">{{ row.items }}</td>
            <td class="text-left">{{ Math.round(row.items / totalAparelhos * 100 * 10) / 10 }} %</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="paginacao.total > 1" class="flex row justify-center" style="padding-top: 15px;">
      <q-pagination @input="trocarPagina()" v-model="paginacao.exibida" :max="paginacao.total" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageIndex',
  data () {
    return {
      totalAparelhos: -1,
      rows: [],
      paginacao: {
        atual: 0,
        total: 0,
        exibida: 0,
        cmbs: {},
        ckbs: {}
      },
      cols: {
        Cliente: false,
        Produto: false,
        Marca: false,
        Modelo: false,
        Memoria: false,
        SO: false,
        VersaoSO: false
      },
      ckbs: {
        Cliente: false,
        Produto: false,
        Marca: false,
        Modelo: false,
        Memoria: false,
        SO: false,
        VersaoSO: false
      },
      cmbs: {
        Cliente: [],
        Produto: [],
        Marca: [],
        Modelo: [],
        Memoria: [],
        SO: [],
        VersaoSO: []
      },
      opts: {
        Cliente: [],
        Produto: [],
        Marca: [],
        Modelo: [],
        Memoria: [],
        SO: [],
        VersaoSO: []
      }
    }
  },
  mounted () {
    this.$axios.get('/api/allCombos').then((response) => {
      this.opts.Cliente = response.data.Cliente
      this.opts.Produto = response.data.Produto
      this.opts.Marca = response.data.Marca
      this.opts.Modelo = response.data.Modelo
      this.opts.Memoria = response.data.Memoria
      this.opts.SO = response.data.SO
      this.opts.VersaoSO = response.data.VersaoSO
    }).catch(this.tratarErro)
  },
  methods: {
    filtrar () {
      this.buscar(Object.assign({}, this.ckbs), Object.assign({}, this.cmbs))
    },
    trocarPagina () {
      console.log('Veio')
      this.buscar(Object.assign({}, this.paginacao.ckbs), Object.assign({}, this.paginacao.cmbs), this.paginacao.exibida)
    },
    buscar (ckbs, cmbs, pagina = 1) {
      const groupBy = []
      if (ckbs.Cliente) groupBy.push('Cliente')
      if (ckbs.Produto) groupBy.push('Produto')
      if (ckbs.Marca) groupBy.push('Marca')
      if (ckbs.Modelo) groupBy.push('Modelo')
      if (ckbs.Memoria) groupBy.push('Memoria')
      if (ckbs.SO) groupBy.push('SO')
      if (ckbs.VersaoSO) groupBy.push('VersaoSO')
      const filters = {}
      if (cmbs.Cliente.length > 0) filters.Cliente = cmbs.Cliente
      if (cmbs.Produto.length > 0) filters.Produto = cmbs.Produto
      if (cmbs.Marca.length > 0) filters.Marca = cmbs.Marca
      if (cmbs.Modelo.length > 0) filters.Modelo = cmbs.Modelo
      if (cmbs.Memoria.length > 0) filters.Memoria = cmbs.Memoria
      if (cmbs.SO.length > 0) filters.SO = cmbs.SO
      if (cmbs.VersaoSO.length > 0) filters.VersaoSO = cmbs.VersaoSO
      this.$axios.post('/api/getpage', {groupBy, filters, page: pagina}).then((response) => {
        this.rows = response.data.rows
        this.paginacao.total = response.data.paginacao.total
        this.paginacao.atual = response.data.paginacao.atual
        this.paginacao.exibida = response.data.paginacao.atual
        this.paginacao.cmbs = cmbs
        this.paginacao.ckbs = ckbs
        this.cols = ckbs
        this.totalAparelhos = response.data.totalItems || -1
      }).catch(this.tratarErro)
    },
    limpar () {
      this.ckbs = {
        Cliente: false,
        Produto: false,
        Marca: false,
        Modelo: false,
        Memoria: false,
        SO: false,
        VersaoSO: false
      },
      this.cmbs = {
        Cliente: [],
        Produto: [],
        Marca: [],
        Modelo: [],
        Memoria: [],
        SO: [],
        VersaoSO: []
      }
    },
    tratarErro (erro) {
      if (erro.response) erro = erro.response
      alert(erro.message || ('Erro ' + erro.status))
    }
  }
}
</script>

<style lang="css">
.filterCombo {
  width: 200px;
  margin-left: 20px;
}
.filterCkbx {
  margin-left: 20px;
}

</style>
