<template>
  <div class="container">
    <div class="links">
      <a-form
        :form="form"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 12 }"
        @submit="postProof"
      >
        <a-form-item label="Note">
          <a-input
            v-decorator="[
              'note',
              {
                rules: [
                  { required: true, message: 'Please input your asset!' },
                ],
              },
            ]"
            :disabled="isProving"
            :loading="isProving"
          />
        </a-form-item>
        <a-form-item label="File">
          <a-upload
            v-decorator="[
              'file',
              {
                rules: [
                  { required: true, message: 'Please input your asset!' },
                ],
              },
            ]"
            :disabled="isProving"
            :loading="isProving"
            :file-list="fileList"
            :remove="handleRemove"
            :before-upload="beforeUpload"
          >
            <a-button :disabled="isProving" :loading="isProving">
              <a-icon type="upload" /> Select File
            </a-button>
          </a-upload>
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
          <a-button
            size="large"
            type="primary"
            html-type="submit"
            :disabled="isProving || fileList.length === 0"
            :loading="isProving"
            style="margin-top: 16px"
          >
            Submit
          </a-button>
        </a-form-item>
      </a-form>
      <a-card title="Result">
        <vue-json-pretty :path="'res'" :data="currentProof"> </vue-json-pretty>
      </a-card>
    </div>
  </div>
</template>
<script lang="ts">
import { mapState } from 'vuex'
import VueJsonPretty from 'vue-json-pretty'
// What we export here will be avaliable in our template.
export default {
  components: {
    VueJsonPretty,    // To help us render the JSON properly.
  },
  transition: 'page',
  data() {
  // These are our local variables.
    return {
      formLayout: 'horizontal',
      form: this.$form.createForm(this, { name: 'coordinated' }),
      uploading: false,
      fileList: [],
    }
  },
  // This allows us to use our global state within this page.
  computed: mapState(['isProving', 'currentProof']),
  // Our methods will go here...
  methods: {
    normFile(e: Event) {
      console.log('Upload event:', e)
      if (Array.isArray(e)) {
        return e
      }
      return e && e.fileList
    },
    postProof(submitEvent: Event) {
      submitEvent.preventDefault()
      this.form.validateFields(
        async (
          err: Object,
          values: { note: String; file: { file: File; fileList: Array<File> } }
        ) => {
          if (!err) {
            /**
             * Convert file to base 64.
             */
            const toBase64 = (file: File) =>
              new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.readAsDataURL(file)
                reader.onload = () => resolve(reader.result)
                reader.onerror = (error) => reject(error)
              })
            const base64File = await toBase64(values.file.file)
            // Prove it.
            this.$message.loading(
              `Proving ${values.file.file.name} with note: ${values.note}`
            )
            try {
              await this.$store.dispatch('ACTION_startProving', {
                note: values.note,
                base64File,
                fileName: values.file.file.name,
              })
              this.$message.success(`${values.file.file.name} proof created!`)
            } catch (e) {
              console.error(e)
              this.$message.error(`Failed to create proof.`)
              this.$store.commit('SET_isProving', false)
            } finally {
              // Cleanup
            }
          }
        }
      )
    },
    handleRemove(file: File) {
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
    },
    beforeUpload(file: File) {
      this.fileList = [...this.fileList, file]
      return false
    },
  },
}
</script>