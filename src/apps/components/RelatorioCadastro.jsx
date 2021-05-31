import { Box, Grid, makeStyles, Paper } from "@material-ui/core";
import React from "react";
import AppButton from "../../../shared/component/AppButton";
import { formatarCpf } from "../../../shared/helper/formatadores";

const useStyles = makeStyles(() => ({
  relatorioContainer: {
    padding: "20px"
  },
  header: {
    fontSize: "0.8rem",
    opacity: "0.6",
    marginBottom: "0",
    borderBottom: "1px solid #ededed"
  },
  line: {
    fontSize: "0.9rem",
    borderBottom: "1px solid #ededed",
    margin: "0 -8px",
    "&:last-child": {
      border: "none"
    }
  }
}));

export default function RelatorioCadastro({ relatorio, setRelatorio }) {
  const classes = useStyles();
  return (
    <>
      <h4>Relatório de Cadastro</h4>
      <Paper className={classes.relatorioContainer}>
        <Grid container spacing={2} alignItems="center" className={classes.header}>
          <Grid item xs={3}>
            CPF
          </Grid>
          <Grid item xs={5}>
            Motivo
          </Grid>
          <Grid item xs={3}>
            Operação ou erro
          </Grid>
        </Grid>
        {relatorio.map((item) => (
          <Grid container spacing={2} alignItems="center" className={classes.line}>
            <Grid item xs={3}>
              {item.cpf ? formatarCpf(item.cpf) : "-"}
            </Grid>
            <Grid item xs={5}>
              {item.motivo ?? "-"}
            </Grid>
            <Grid item xs={3}>
              {item.operacao}
            </Grid>
          </Grid>
        ))}
      </Paper>
      <Box marginTop="40px" textAlign="center">
        <AppButton onClick={() => setRelatorio(null)}>Voltar</AppButton>
      </Box>
    </>
  );
}
