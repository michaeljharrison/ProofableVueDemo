export const state: any = () => ({
  isProving: false, // For loading spinners and buttons.
  currentProof: {}, // To hold our proof result.
  verifyProofResult: {}, // To hold our verify proof result.
})

export const mutations = {
  SET_isProving(state: State, isProving: boolean) {
    state.isProving = isProving
  },
  SET_currentProof(state: State, proof: Proof) {
    state.currentProof = proof
  },
  SET_verifyProofResult(state: State, result: Number) {
    state.verifyProofResult = result
  },
}

export const actions = {
  // Action to prove a file along with a note using Proofable.
  async ACTION_startProving(
    { commit }: any,
    options: { note: String; base64File: String; fileName: String }
  ) {
    commit('SET_isProving', true) // Start proving (lock UI)
    const { note, base64File, fileName } = options
    // Our proof takes the form of an array of key values.
    const data = JSON.stringify({
      items: [
        { key: 'fileName', value: fileName },
        { key: 'note', value: note },
        { key: 'base64', value: base64File },
      ],
    })
    // Setup our REST call (POST)
    const config = {
      method: 'post',
      url: 'https://api.proofable.io/rest/prove',
      headers: {
        Authorization: `Bearer eyJhbGcaabiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDM5NDExMzEsImp0aSI6IkZLeWUxTUd2LTdSdDR4RG9OdVFBWUk3Z0FXVl9DVWxob0ZZMWl4bE42ZjQ9Iiwic3ViIjoidWZmMGdtNHV2cG13MmJ2Z3J2NWhpNWF4In0.RAC2eqhJkXRBUSPcYa54LtabWjI0GbEv4BjrRKsao-k`,
        'Content-Type': 'application/json',
      },
      data,
    }
    // Make the call.
    const proof = await this.$axios(config)
    // Set our state to reflect in the UI.
    console.log(proof.data)
    commit('SET_currentProof', proof.data.proof)
    commit('SET_isProving', false)
  },
  async ACTION_startVerifying(
    { commit }: any,
    options: { trieId: String; proofId: String }
  ) {
    commit('SET_isProving', true) // Start verifying (lock UI)
    const { trieId, proofId } = options
    // Setup our REST call (GET)
    const data = JSON.stringify({
      trieId,
      proofId,
      outputItems: true,
    })
    const config = {
      method: 'post',
      url: `https://api.proofable.io/rest/verify`,
      headers: {
        Authorization: `Bearer eyJhbGciOiawefUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDM5NDExMzEsImp0aSI6IkZLeWUxTUd2LTdSdDR4RG9OdVFBWUk3Z0FXVl9DVWxob0ZZMWl4bE42ZjQ9Iiwic3ViIjoidWZmMGdtNHV2cG13MmJ2Z3J2NWhpNWF4In0.RAC2eqhJkXRBUSPcYa54LtabWjI0GbEv4BjrRKsao-k`,
        'Content-Type': 'application/json',
      },
      data,
    }
    // Make the call
    const result = await this.$axios(config)
    // Set our state to reflect in the UI.
    commit('SET_verifyProofResult', result.data)
    commit('SET_isProving', false)
  },
}
