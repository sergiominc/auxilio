import React, { useState } from "react";
import { Field, Form } from "react-final-form";
import createDecorator from "final-form-focus";
import { Box, Grid, makeStyles } from "@material-ui/core";
import AppInput from "../../../shared/component/AppInput";
import { composeValidators, validarCpf, validarObrigatoriedade } from "../../../shared/helper/validadores";
import { cpfMask } from "../../../shared/helper/masks";
import AppButton from "../../../shared/component/AppButton";
import { getRawParam } from "../../../shared/helper/utilitarioString";
import NewdooApi from "../../../shared/clients/NewdooClient";
import { showError, showSuccess } from "../../../shared/helper/messages";
import { trataErroDoAxios } from "../../../shared/helper/erro";
import AppLinearProgress from "../../../shared/component/AppLinearProgress";
import useLoading from "../../../shared/hooks/useLoading";
import _ from "lodash";
import AppReadonly from "../../../shared/component/AppReadonly";
import AppModal from "../../../shared/component/AppModal";
import { MSG_ERRO_OFFLINE } from "../../../shared/constantes/mensagens";
import FormularioListaBloqueio from "../../cadastro-motivo/components/FormularioListaBloqueio";

const useStyles = makeStyles((theme) => ({
  notfound: {
    fontSize: "1.2em",
    color: "#999999",
    fontWeight: "600",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: "40px"
  }
}));
export default function CadastroLiberacaoCPF() {
  const classes = useStyles();
  const [confirmacaoModal, setConfirmacaoModal] = useState(false);
  const [dadosBloqueios, setDadosBloqueios] = useState([]);
  const [inicio, setInicio] = useState(true);
  const [liberar, setLiberar] = useState(false);

  const buscarDadosBloqueios = async (values) => {
    try {
      let bloqueios = await NewdooApi.getBloqueiosByCpf(values.cpf);
      setDadosBloqueios(bloqueios);
      setInicio(false);
      setLiberar(false);
    } catch (e) {
      showError("Não foi possível obter os bloqueios do CPF informado");
    }
  };

  const resetForm = (values, form) => {
    setTimeout(form.reset);
    Object.keys(values).forEach((key) => {
      form.change(key, undefined);
      form.resetFieldState(key);
    });
  };

  const onSubmitDados = async (values, form) => {
    try {
      const valuesCompleto = { ...values, operacao: "2" };
      await NewdooApi.postLiberacaoCPF(valuesCompleto);
      resetForm(values, form);
      showSuccess("Operação realizada com sucesso.");
      //buscarDadosBloqueios(values);
      setDadosBloqueios([]);
      setInicio(true);
    } catch (e) {
      if (e.response && e.response.status === 404) {
        showError("CPF não encontrado");
      } else if (e.response && e.response.status === 409) {
        showError(trataErroDoAxios(e));
      } else {
        showError(MSG_ERRO_OFFLINE);
      }
      setLiberar(true);
    }
  };

  const focusOnErrors = createDecorator();

  const [isLoadingOnSubmitDados, onSubmitDadosWithLoading] = useLoading(onSubmitDados);

  return (
    <Form
      onSubmit={(values, form) => {
        // onSubmitDadosWithLoading(values, form);
        setConfirmacaoModal(true);
      }}
      decorators={[focusOnErrors]}
      render={({ handleSubmit, values, form }) => (
        <form
          onSubmit={(event) => {
            handleSubmit(event);
          }}>
          {isLoadingOnSubmitDados && <AppLinearProgress />}
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={3}></Grid>

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

            <Grid item xs={3}>
              <AppReadonly label="Código do motivo" value="Todos" />
            </Grid>
          </Grid>
          <Grid item xs={3}></Grid>

          <Box marginTop="40px" textAlign="center">
            <AppButton secondary="true" onClick={() => buscarDadosBloqueios(values)} style={{ marginRight: "20px" }}>
              Pesquisar
            </AppButton>

            {dadosBloqueios.length > 0 && (
              <AppButton type="submit" disabled={isLoadingOnSubmitDados}>
                Liberar
              </AppButton>
            )}
          </Box>
          <AppModal
            title="Liberação de todos os motivos do CPF"
            open={confirmacaoModal}
            setOpen={setConfirmacaoModal}
            mainAction={() => onSubmitDadosWithLoading(values, form)}
            mainButtonDisabled={isLoadingOnSubmitDados}
            mainText="Sim"
            closeButtonText="Não">
            <strong>Confirma essa operação?</strong>
          </AppModal>

          {dadosBloqueios.length > 0 && (
            <Grid item xs={12}>
              <FormularioListaBloqueio dados={dadosBloqueios} />
            </Grid>
          )}
          {!inicio && !liberar && dadosBloqueios.length === 0 && (
            <p className={classes.notfound}>O sistema não identificou para o CPF nenhum bloqueio ou cancelamento.</p>
          )}
        </form>
      )}></Form>
  );
}
