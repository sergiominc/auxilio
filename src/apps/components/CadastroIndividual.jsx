import React, { useEffect, useState } from "react";
import { Field, Form, FormSpy } from "react-final-form";
import createDecorator from "final-form-focus";
import { Box, Grid, makeStyles, TextField } from "@material-ui/core";
import AppInput from "../../../shared/component/AppInput";
import { composeValidators, validarCpf, validarObrigatoriedade } from "../../../shared/helper/validadores";
import { cpfMask, numberMask } from "../../../shared/helper/masks";
import AppTextArea from "../../../shared/component/AppTextArea";
import AppButton from "../../../shared/component/AppButton";
import { getRawNumber, getRawParam } from "../../../shared/helper/utilitarioString";
import NewdooApi from "../../../shared/clients/NewdooClient";
import { showError, showSuccess } from "../../../shared/helper/messages";
import { tipoOperacao } from "../constants";
import { trataErroDoAxios } from "../../../shared/helper/erro";
import { getMensagemErro409 } from "../erro";
import AppLinearProgress from "../../../shared/component/AppLinearProgress";
import useLoading from "../../../shared/hooks/useLoading";
import AppAutocomplete from "../../../shared/component/AppAutocomplete";
import _ from "lodash";
import { MSG_ERRO_OFFLINE } from "../../../shared/constantes/mensagens";

const selectorCss = {
  cursor: "pointer",
  width: "18px",
  height: "18px",
  marginRight: "10px",
  marginTop: "4px",
  float: "left"
};

const useStyles = makeStyles(() => ({
  radio: {
    margin: "3px",
    display: "inline-block",
    marginRight: "20px",
    "& div": {
      fontSize: "0.9em",
      lineHeight: "25px",
      color: "#555555"
    },
    "& div:first-child": {
      fontSize: "1.0em",
      lineHeight: "25px"
    }
  },
  radioGroup: {
    width: "100%",
    position: "relative"
  },
  erro: {
    color: "red",
    fontSize: "0.8em",
    position: "absolute",
    left: "8px",
    bottom: "-28px"
  }
}));

export default function CadastroIndividual() {
  const classes = useStyles();
  const [motivos, setMotivos] = useState([]);

  const resetForm = (values, form) => {
    setTimeout(form.reset);
    Object.keys(values).forEach((key) => {
      form.change(key, undefined);
      form.resetFieldState(key);
    });
  };

  const onSubmitDados = async (values, form) => {
    try {
      await NewdooApi.postBloqueioCancelamentoLiberacaoIndividual(values);
      resetForm(values, form);
      showSuccess("Operação realizada com sucesso.");
    } catch (e) {
      if (e.response && e.response.status === 404) {
        showError("CPF não encontrado");
      } else if (e.response?.status === 409) {
        const msg = getMensagemErro409(e.response.data?.codigo);
        showError(msg);
      } else if (e.response) {
        showError(trataErroDoAxios(e));
      } else {
        showError(MSG_ERRO_OFFLINE);
      }
    }
  };

  const buscarMotivosBloqueios = async () => {
    try {
      let response = await NewdooApi.getMotivosBloqueios();
      if (response && response.length > 1) {
        response = _.sortBy(response, ["id"]);
      }
      setMotivos(response);
    } catch (e) {
      showError("Não foi possível obter os motivos de bloqueio");
    }
  };

  useEffect(() => {
    buscarMotivosBloqueios();
  }, []);

  const focusOnErrors = createDecorator();

  const [isLoadingOnSubmitDados, onSubmitDadosWithLoading] = useLoading(onSubmitDados);

  return (
    <Form
      onSubmit={(values, form) => {
        onSubmitDadosWithLoading(values, form);
      }}
      decorators={[focusOnErrors]}
      render={({ handleSubmit, values, form }) => (
        <form
          onSubmit={(event) => {
            handleSubmit(event);
          }}>
          {isLoadingOnSubmitDados && <AppLinearProgress />}
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={3}>
              <Field
                name="cpf"
                validate={composeValidators(validarObrigatoriedade, validarCpf)}
                format={(value) => (value ? cpfMask(value) : "")}
                parse={getRawParam}>
                {({ input, meta: { invalid, error, touched } }) => (
                  <AppInput
                    label="CPF*"
                    error={touched && invalid}
                    helperText={touched && error}
                    inputProps={{ maxLength: "14" }}
                    {...input}
                  />
                )}
              </Field>
            </Grid>

            <Grid item xs={4}>
              <Field name="numeroSEI" parse={getRawNumber} format={(value) => (value ? numberMask(value) : "")}>
                {({ input, meta: { error, invalid, touched } }) => (
                  <AppInput
                    {...input}
                    label="Número SEI"
                    inputProps={{ maxLength: "17" }}
                    error={touched && invalid}
                    helperText={touched && error}
                  />
                )}
              </Field>
            </Grid>

            <Grid item xs={5}>
              <Field name="codigoMotivo" validate={validarObrigatoriedade}>
                {({ input, meta: { error, invalid, touched } }) => (
                  <AppAutocomplete
                    {...input}
                    label="Código do motivo*"
                    error={touched && invalid}
                    helperText={touched && error}
                    options={motivos || []}
                    noOptionsText="Nenhum motivo encontrado"
                    getOptionLabel={(option) => {
                      option = option.id ? option : _.find(motivos, (m) => m.id === option);
                      return option ? option.id + " - " + option.motivo : "";
                    }}
                    onChange={(event, value) => {
                      form.change("codigoMotivo", value ? value.id : null);
                    }}
                    renderInput={(params) => <TextField {...params} variant="outlined" />}
                  />
                )}
              </Field>
            </Grid>

            <Grid item xs={12}>
              <Field name="observacao" parse={(value) => (value ? value : "")}>
                {({ input, meta: { error, invalid, touched } }) => (
                  <AppTextArea label="Observação" {...input} maxLength="1000" />
                )}
              </Field>
            </Grid>

            <Grid item xs={12}>
              <Field name="relatorio" parse={(value) => (value ? value : "")}>
                {({ input, meta: { error, invalid, touched } }) => (
                  <AppInput
                    {...input}
                    label="Relatório"
                    inputProps={{ maxLength: "100" }}
                    error={touched && invalid}
                    helperText={touched && error}
                  />
                )}
              </Field>
            </Grid>

            <p style={{ fontSize: "0.8em", margin: "8px" }}>Operação*</p>
            <div className={classes.radioGroup}>
              <div className={classes.radio}>
                <div>
                  <Field
                    style={selectorCss}
                    className={classes.selector}
                    name="operacao"
                    component="input"
                    type="radio"
                    value={tipoOperacao.Bloqueio}
                    checked={values.operacao === tipoOperacao.Bloqueio}
                    validate={validarObrigatoriedade}
                  />
                  Bloqueio
                </div>
              </div>
              <div className={classes.radio}>
                <div>
                  <Field
                    style={selectorCss}
                    name="operacao"
                    component="input"
                    type="radio"
                    value={tipoOperacao.Cancelamento}
                    checked={values.operacao === tipoOperacao.Cancelamento}
                    validate={validarObrigatoriedade}
                  />
                  Cancelamento
                </div>
              </div>
              <div className={classes.radio}>
                <div>
                  <Field
                    style={selectorCss}
                    name="operacao"
                    component="input"
                    type="radio"
                    value={tipoOperacao.Liberacao}
                    checked={values.operacao === tipoOperacao.Liberacao}
                    validate={validarObrigatoriedade}
                  />
                  Liberação
                </div>
              </div>
              <FormSpy subscription={{ errors: true, submitFailed: true }}>
                {({ errors, submitFailed }) => {
                  return submitFailed && errors["operacao"] ? <p className={classes.erro}>Campo obrigatório</p> : null;
                }}
              </FormSpy>
            </div>
          </Grid>

          <Box marginTop="40px" textAlign="center">
            <AppButton type="submit" disabled={isLoadingOnSubmitDados}>
              Enviar
            </AppButton>
          </Box>
        </form>
      )}></Form>
  );
}
