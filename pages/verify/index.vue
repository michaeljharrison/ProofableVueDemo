<template>
  <div class="container">
    <div class="links">
      <a-form
        :form="form"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 12 }"
        initial
        @submit="verifyProof"
      >
        <a-form-item label="Trie ID">
          <a-input
            v-decorator="[
              'trieID',
              {
                rules: [
                  { required: true, message: 'Please input your trieID!' },
                ],
                initialValue: currentProof.trieId,
              },
            ]"
            :disabled="isProving"
            :loading="isProving"
          />
        </a-form-item>
        <a-form-item label="Proof ID">
          <a-input
            v-decorator="[
              'proofID',
              {
                rules: [
                  { required: true, message: 'Please input your proofID!' },
                ],
                initialValue: currentProof.id,
              },
            ]"
            :disabled="isProving"
            :loading="isProving"
          />
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 12, offset: 5 }">
          <a-button
            size="large"
            type="primary"
            html-type="submit"
            :disabled="isProving"
            :loading="isProving"
            style="margin-top: 16px"
          >
            Submit
          </a-button>
        </a-form-item>
      </a-form>
      <a-card title="Result">
        <vue-json-pretty :path="'res'" :data="verifyProofResult">
        </vue-json-pretty>
      </a-card>
    </div>
  </div>
</template>
<script lang="ts">
import { mapState } from 'vuex'
import VueJsonPretty from 'vue-json-pretty'
export default {
  components: {
    VueJsonPretty,
  },
  transition: 'page',
  data() {
    return {
      formLayout: 'horizontal',
      form: this.$form.createForm(this, { name: 'coordinated' }),
    }
  },
  computed: mapState(['isProving', 'currentProof', 'verifyProofResult']),
  methods: {
    verifyProof(submitEvent: Event) {
      submitEvent.preventDefault()
      this.form.validateFields(
        async (err: Object, values: { trieID: String; proofID: string }) => {
          if (!err) {
            // Prove it.
            this.$message.loading(`Verifying proof ${values.proofID}`)
            try {
              await this.$store.dispatch('ACTION_startVerifying', {
                trieId: values.trieID,
                proofId: values.proofID,
              })
              this.$message.success(`${values.proofID} proof verified!`)
            } catch (e) {
              console.error(e)
              this.$message.error(`Failed to verify proof.`)
              this.$store.commit('SET_isProving', false)
            } finally {
              // Cleanup
            }
          }
        }
      )
    },
  },
}
</script>
