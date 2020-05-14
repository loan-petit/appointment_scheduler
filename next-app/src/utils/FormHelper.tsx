export type FieldInformation = {
  value: any
  error: string
}

export type FieldsInformation = {
  [key: string]: FieldInformation
}

export type SubmitStatus = {
  isSubmitted: boolean
  response: any
  error: any
  userFriendlyError: string
}

type Props = {
  fields: string[]
  refreshComponent: () => void
  fieldsValidator: (name: string, value: string) => string
  onSubmit: (
    fieldsInformation: FieldsInformation,
    additionalVariables?: Object,
  ) => void
  onSubmitResult: (submitStatus: SubmitStatus) => string
}

class FormHelper {
  fieldsInformation: FieldsInformation
  refreshComponent: () => void
  fieldsValidator: (name: string, value: string) => string
  onSubmit: (
    fieldsInformation: FieldsInformation,
    additionalVariables?: Object,
  ) => void
  onSubmitResult: (submitStatus: SubmitStatus) => string
  submitStatus: SubmitStatus

  constructor(props: Props) {
    this.fieldsInformation = props.fields.reduce(
      (obj: FieldsInformation, v) => {
        obj[v] = { value: '', error: '' }
        return obj
      },
      {},
    )

    this.refreshComponent = props.refreshComponent
    this.fieldsValidator = props.fieldsValidator
    this.onSubmit = props.onSubmit
    this.onSubmitResult = props.onSubmitResult

    this.submitStatus = {
      isSubmitted: false,
      response: null,
      error: null,
      userFriendlyError: '',
    }
  }

  updateFieldValues(fieldValues: { [key: string]: string }) {
    Object.entries(fieldValues).forEach(([key, value]) => {
      if (this.fieldsInformation[key]) {
        this.fieldsInformation[key].value = value
      }
    })
    this.refreshComponent()
  }

  validateForm() {
    let isValid = true

    Object.entries(this.fieldsInformation).forEach(([key, value]) => {
      let error = this.fieldsValidator(key, value.value)
      this.fieldsInformation[key].error = error
      if (error.length) isValid = false
    })

    if (!isValid) {
      this.refreshComponent()
    }
    return isValid
  }

  handleInputChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const name = event.target.name
    const value = event.target.value
    const error = this.fieldsValidator(name, value)

    this.fieldsInformation[name].value = value
    this.fieldsInformation[name].error = error
    this.refreshComponent()
  }

  async handleSubmit(
    event: React.MouseEvent<HTMLButtonElement>,
    additionalVariables?: Object,
  ) {
    event.preventDefault()

    if (this.validateForm()) {
      this.submitStatus.error = null
      this.submitStatus.response = null

      try {
        this.submitStatus.response = await this.onSubmit(
          this.fieldsInformation,
          additionalVariables,
        )
      } catch (err) {
        this.submitStatus.error = err
      }

      this.submitStatus.isSubmitted = true
      this.submitStatus.userFriendlyError = this.onSubmitResult(
        this.submitStatus,
      )
      this.refreshComponent()
    }
  }
}

export default FormHelper
