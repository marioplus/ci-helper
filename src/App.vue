<script lang="ts" setup>
import {onMounted, reactive, watch} from 'vue'
import CssLoader from './components/CssLoader.vue'
import '@mdi/font/css/materialdesignicons.css'
import {STORAGE_USER_PARAM_GROUPS} from './constant/Constant'
import {GmUtils} from './utils/GmUtils'
import {Logger} from './utils/Logger'
import {JsonUtils} from './utils/JsonUtils'

class Param {
  name: string = ''
  value: string = ''
}

class ParamGroup {
  name: string = ''
  params: Param[] = []
}

// 当前流水线配置
const pipeline = reactive({
  ref: '',
  paramGroup: new ParamGroup()
})
watch(pipeline, () => {
  const params = pipeline.paramGroup.params
  // 没有参数时增加空参数
  if (params.length == 0) {
    pipeline.paramGroup.params.push(new Param())
    return
  }

  // 最后一个名称或者参数不为空时增加空参数
  const param = params[params.length - 1]
  if (param.name || param.value) {
    pipeline.paramGroup.params.push(new Param())
  }
})

// 引用
const refs = reactive([] as string[])

// 初始引用
function initRefs() {
  const refEls = document.querySelectorAll('#new-pipeline-form > .form-group div.dropdown > .dropdown-select > .dropdown-content li > a')
  refEls.forEach(refEl => {
    // a
    const ref: string = refEl.textContent?.trim() as string
    if (ref) {
      refs.push(ref)
      // 激活状态的
      if (refEl.classList.contains('is-active')) {
        pipeline.ref = ref
      }
    }
  })
}

// 用户流水线参数组
const userParamGroups = reactive([] as ParamGroup[])

function loadUserParamGroups() {
  userParamGroups.push(...GmUtils.getValue(Array<ParamGroup>, STORAGE_USER_PARAM_GROUPS, []))
  Logger.debug('加载用户保存参数组', JsonUtils.toJsonString(userParamGroups, true))
}

// 选择变量组
function selectVariableGroup(selected: ParamGroup) {
  Logger.info('选择变量组', JsonUtils.toJsonString(selected, true))
  pipeline.paramGroup = selected
}

const removeParam = (index: number) => {
  if (pipeline.paramGroup.params.length > 1) {
    pipeline.paramGroup.params.splice(index, 1)
  }
}

const submitForm = () => {
  alert(JsonUtils.toJsonString(pipeline))
}

// 移除变量组
const removeUserParamGroup = (index: number) => {
  if (userParamGroups.length > 1) {
    userParamGroups.splice(index, 1)
  }
  GmUtils.setValue(STORAGE_USER_PARAM_GROUPS, userParamGroups)
}

// 保存变量组
const saveParamGroup = (save: ParamGroup) => {
  Logger.info('要保存的的group: 带过滤', JsonUtils.toJsonString(save, true))
  save.params = save.params.filter(v => v.name && v.value && v.name !== '' && v.value !== '')
  Logger.info('要保存的的group: 过滤后', JsonUtils.toJsonString(save, true))

  Logger.info('现有的groups', JsonUtils.toJsonString(userParamGroups, true))
  const beSaveUserParamGroups = userParamGroups.filter(g => g.name !== save.name)
  beSaveUserParamGroups.push(save)
  Logger.info('保存的groups', JsonUtils.toJsonString(beSaveUserParamGroups, true))
  GmUtils.setValue(STORAGE_USER_PARAM_GROUPS, beSaveUserParamGroups)
  userParamGroups.splice(0, userParamGroups.length, ...beSaveUserParamGroups)
}

onMounted(() => {
  loadUserParamGroups()
  initRefs()
})

</script>

<template>
  <css-loader/>
  <v-container>
    <v-row>
      <v-col cols="auto"><h4>流水线预设</h4></v-col>
    </v-row>
    <v-row>
      <!-- 预设列表 -->
      <v-col>
        <v-sheet>
          <v-chip-group mandatory selected-class="text-primary">
            <v-chip
                v-for="(paramGroups,index) in userParamGroups"
                :key="paramGroups.name"
                :text="paramGroups.name"
                closable
                @click="selectVariableGroup(paramGroups)"
                @click:close="removeUserParamGroup(index)"
            ></v-chip>
          </v-chip-group>
        </v-sheet>
      </v-col>
    </v-row>
    <v-row justify="end">
      <v-col cols="2">
        <v-btn block color="blue" @click="Logger.debug(JsonUtils.toJsonString(userParamGroups,true))">打印预设变量组
        </v-btn>
      </v-col>
      <v-col cols="2">
        <v-btn block color="red" @click="GmUtils.setValue(STORAGE_USER_PARAM_GROUPS,[])">清理预设变量组
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="auto"><h4>运行流水线</h4></v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-form>
          <v-row>
            <v-col>
              <v-combobox v-model="pipeline.ref" :items="refs" label="分支/标签"/>
            </v-col>
          </v-row>
          <v-row v-for="(param, index) in pipeline.paramGroup.params" :key="index">
            <v-col>
              <v-text-field v-model="param.name"
                            clearable
                            label="变量名称"
                            required/>
            </v-col>
            <v-col>
              <v-text-field v-model="param.value"
                            clearable
                            label="变量值"/>
            </v-col>
            <v-col v-if="pipeline.paramGroup.params.length > 1" cols="auto">
              <v-btn icon @click="removeParam(index) ">
                <v-icon icon="mdi-close"/>
              </v-btn>
            </v-col>
          </v-row>
          <v-row justify="end">
            <v-col cols="2">
              <v-btn block color="green" @click="submitForm">创建流水线</v-btn>
            </v-col>
            <v-col cols="2">
              <v-btn block color="primary">保存为预设</v-btn>
              <v-dialog activator="parent" max-width="500">
                <template v-slot:default="{ isActive }">
                  <v-card rounded="lg">
                    <v-card-title class="d-flex justify-space-between align-center">
                      <div class="text-h5 text-medium-emphasis">
                        保存为预设
                      </div>

                      <v-btn
                          icon="mdi-close"
                          variant="text"
                          @click="()=>{
                            isActive.value = false
                          }"
                      ></v-btn>
                    </v-card-title>

                    <v-divider class="mb-4"></v-divider>

                    <v-card-text>
                      <div class="text-medium-emphasis mb-4">
                        输入名称保存变量组，已存在的会被替代
                      </div>

                      <div class="mb-2">变量组名称</div>

                      <v-text-field
                          v-model="pipeline.paramGroup.name"
                          clearable
                          required
                          variant="outlined"
                      ></v-text-field>
                    </v-card-text>

                    <v-divider></v-divider>

                    <v-card-actions class="d-flex justify-end">
                      <v-btn
                          class="text-none"
                          rounded="xl"
                          text="取消"
                          @click="isActive.value = false"
                      ></v-btn>

                      <v-btn
                          class="text-none"
                          color="primary"
                          rounded="xl"
                          text="保存"
                          variant="flat"
                          @click="()=>{
                            const group = new ParamGroup()
                            group.name=pipeline.paramGroup.name
                            group.params= pipeline.paramGroup.params
                            saveParamGroup(group)
                            isActive.value = false
                          }"
                      ></v-btn>
                    </v-card-actions>
                  </v-card>
                </template>
              </v-dialog>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

