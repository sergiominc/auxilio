import React, { useEffect, useState, useRef } from "react";
import { makeStyles, Grid, Box } from "@material-ui/core";
import { useParams, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import useLoading from "../../shared/hooks/useLoading";
import NewdooApi from "../../shared/clients/NewdooClient";
import { isCpf } from "../../shared/helper/validadores";
import { alterarNumber, limparNumber } from "../../painel/actions";
import Loading from "../../shared/template/Loading";
import { ErrorScreen } from "../../shared/template/InfoScreen";
import { MSG_ERRO_SERVIDOR, MSG_ERRO_OFFLINE } from "../../shared/constantes/mensagens";
import PainelGrupo from "../../painel/template/PainelGrupo";
import CancelPresentationIcon from "@material-ui/icons/CancelPresentation";
import TooltipedItem from "../administracao/components/TooltipedItem";
import { formatarData } from "../../shared/helper/utilitarioData";
import AppModal from "../../shared/component/AppModal";
import AppLabelValue from "../../shared/component/AppLabelValue";
import { formatarCpf } from "../../shared/helper/formatadores";
import { trataResultadoAvaliacao, getInegebilidadeParcelasByID } from "../../shared/helper/parcelas";

const useStyles = makeStyles((theme) => ({
  root: {
    margin: "20px"
  },
  header: {
    fontSize: "0.8em",
    color: "#999999",
    borderBottom: "1px solid #CCCCCC",
    [theme.breakpoints.down("md")]: {
      fontSize: "0.7em"
    }
  },
  line: {
    marginTop: "12px",
    padding: "4px 0",
    borderBottom: "1px solid #CCCCCC",
    fontSize: "0.8em",
    "&:hover": {
      backgroundColor: "#f6f6f6",
      cursor: "pointer"
    }
  },
  secondary: {
    color: "#747474"
  },
  item: {
    fontSize: "1.0em",
    [theme.breakpoints.down("md")]: {
      fontSize: "0.9em"
    }
  }
}));

export default function ConsultaBloqueioParcelas() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const [error, setError] = useState(false);
  const [dados, setDados] = useState(null);
  const [itemDetalhado, setItemDetalhado] = useState(null);
  const historyRef = useRef(history);
  const { number: numberParam } = useParams();

  const buscarBloqueioParcelas = async (number) => {
    try {
      setDados(null);
      setError(false);
      const dados = await NewdooApi.getDetalhesParcelasBy(number);
      setDados(dados);
    } catch (e) {
      if (e.response) {
        setError(MSG_ERRO_SERVIDOR);
      } else {
        setError(MSG_ERRO_OFFLINE);
      }
    }
  };

  const [loading, buscarBloqueioParcelasWithLoading] = useLoading(buscarBloqueioParcelas);
  const buscarBloqueioParcelasWithLoadingRef = useRef(buscarBloqueioParcelasWithLoading);

  useEffect(() => {
    const number = numberParam && parseInt(numberParam, 10);
    if (isCpf(number)) {
      buscarBloqueioParcelasWithLoadingRef.current(number);
      dispatch(alterarNumber(number));
    } else {
      dispatch(limparNumber());
      historyRef.current.push("/");
    }
  }, [dispatch, numberParam, historyRef, buscarBloqueioParcelasWithLoadingRef]);

  return (
    <PainelGrupo
      title={"Consulta Bloqueio de Parcelas - CPF: " + formatarCpf(numberParam)}
      icon={CancelPresentationIcon}
      big={true}>
      {loading && <Loading />}
      {error && !loading && <ErrorScreen primaryText={error} />}
      {!loading && !error && dados && dados.length > 0 && (
        <>
          <Grid container spacing={3} className={classes.header} alignItems="center">
            <Grid item xs={3}>
              SEI
            </Grid>
            <Grid item xs={2}>
              Origem Bloqueio
            </Grid>
            <Grid item xs={3}>
              Detalhe Desbloqueio
            </Grid>
            <Grid item xs={2}>
              Data Início
            </Grid>
            <Grid item xs={2}>
              Avaliação
            </Grid>
          </Grid>
          {dados.map((item, i) => {
            return (
              <Grid
                key={i}
                container
                alignItems="center"
                spacing={3}
                className={classes.line}
                onClick={() => setItemDetalhado(item)}>
                <Grid item xs={3}>
                  <TooltipedItem label={item.sei || "-"} />
                </Grid>
                <Grid item xs={2}>
                  <TooltipedItem label={item.origemBloqueio || "-"} />
                </Grid>
                <Grid item xs={3}>
                  <TooltipedItem label={item.detalhedesbloqueio || "-"} />
                </Grid>
                <Grid item xs={2}>
                  <TooltipedItem label={item.dataInicio ? formatarData(item.dataInicio) : "-"} />
                </Grid>
                <Grid item xs={2}>
                  <TooltipedItem label={trataResultadoAvaliacao(item.avaliacao)} />
                </Grid>
              </Grid>
            );
          })}
        </>
      )}
      {!loading && !error && (!dados || dados.length === 0) && (
        <Box textAlign="center">
          <p>Não há bloqueios para o CPF informado.</p>
        </Box>
      )}
      {itemDetalhado && (
        <AppModal
          title="Detalhes do bloqueio"
          open={itemDetalhado}
          setOpen={setItemDetalhado}
          onClose={() => setItemDetalhado(false)}
          mainText="Fechar">
          <Grid container spacing={2} style={{ marginBottom: "20px" }}>
            <Grid item xs={4}>
              <AppLabelValue label="Carga" value={itemDetalhado.carga} />
            </Grid>
            <Grid item xs={8}>
              <AppLabelValue label="SEI" value={itemDetalhado.sei || "-"} />
            </Grid>
            <Grid item xs={4}>
              <AppLabelValue label="Origem Bloqueio" value={itemDetalhado.origemBloqueio || "-"} />
            </Grid>
            <Grid item xs={8}>
              <AppLabelValue label="Origem Desbloqueio" value={itemDetalhado.origemDesbloqueio || "-"} />
            </Grid>
            <Grid item xs={12}>
              <AppLabelValue label="Detalhe Bloqueio" value={itemDetalhado.detalheBloqueio || "-"} />
            </Grid>
            <Grid item xs={12}>
              <AppLabelValue label="Detalhe Desbloqueio" value={itemDetalhado.detalhedesbloqueio || "-"} />
            </Grid>
            <Grid item xs={4}>
              <AppLabelValue
                label="Data Início"
                value={itemDetalhado.dataInicio ? formatarData(itemDetalhado.dataInicio) : "-"}
              />
            </Grid>
            <Grid item xs={4}>
              <AppLabelValue
                label="Data Fim"
                value={itemDetalhado.dataFim ? formatarData(itemDetalhado.dataFim) : "-"}
              />
            </Grid>

            <Grid item xs={4}>
              <AppLabelValue label="Envio CAIXA" value={itemDetalhado.envioCaixa ? "Sim" : "Não"} />
            </Grid>
            <Grid item xs={4}>
              <AppLabelValue label="Processado" value={itemDetalhado.processado ? "Sim" : "Não"} />
            </Grid>
            <Grid item xs={4}>
              <AppLabelValue label="Detalhe Avaliação" value={itemDetalhado.detalheAvaliacao || "-"} />
            </Grid>

            <Grid item xs={4}>
              <AppLabelValue
                label="Data Avaliação"
                value={itemDetalhado.dataAvaliacao ? formatarData(itemDetalhado.dataAvaliacao) : "-"}
              />
            </Grid>
            <Grid item xs={4}>
              <AppLabelValue label="Resultado Avaliação" value={itemDetalhado.resultadoAvaliacao || "-"} />
            </Grid>
            <Grid item xs={4}>
              <AppLabelValue label="Avaliação" value={trataResultadoAvaliacao(itemDetalhado.avaliacao)} />
            </Grid>
            <Grid item xs={4}>
              <AppLabelValue label="Carga Avaliação" value={itemDetalhado.cargaAtualizacao || "-"} />
            </Grid>
            <Grid item xs={12}>
              <AppLabelValue
                label="Motivo Inelegibilidade"
                value={getInegebilidadeParcelasByID(itemDetalhado.motivoInegibilidade).detalhamento}
              />
            </Grid>
          </Grid>
        </AppModal>
      )}
    </PainelGrupo>
  );
}
