import React, { useState } from "react";
import { Container, FormControlLabel, FormLabel, makeStyles, Radio, RadioGroup } from "@material-ui/core";
import CadastroLote from "./components/CadastroLote";
import CadastroIndividual from "./components/CadastroIndividual";
import FormTitle from "../../shared/template/FormTitle";
import CadastroLiberacaoCPF from "./components/CadastroLiberacaoCPF";

const useStyles = makeStyles(() => ({
  radioContainer: {
    padding: "16px 80px",
    background: "#f5f5f5",
    borderRadius: "8px",
    width: "fit-content",
    margin: "10px auto",
    textAlign: "center"
  },
  radioLabel: {
    marginRight: "24px"
  }
}));

export default function CadastroBloqueio() {
  const classes = useStyles();
  const [tipoCadastro, setTipoCadastro] = useState("lote");

  return (
    <Container maxWidth="md">
      <FormTitle title="Cancelamento, Bloqueio e Liberação" />
      <div className={classes.radioContainer}>
        <FormLabel>Opção de cadastro</FormLabel>
        <RadioGroup row value={tipoCadastro} onChange={(e) => setTipoCadastro(e.target.value)}>
          <FormControlLabel classes={{ root: classes.radioLabel }} value="lote" control={<Radio />} label="Lote" />
          <FormControlLabel value="individual" control={<Radio />} label="Individual" />
          {/* <FormControlLabel value="liberacaoCPF" control={<Radio />} label="Liberação de todos os motivos do CPF" /> */}
        </RadioGroup>
      </div>
      {tipoCadastro === "lote" && <CadastroLote />}
      {tipoCadastro === "individual" && <CadastroIndividual />}
      {/* {tipoCadastro === "liberacaoCPF" && <CadastroLiberacaoCPF />} */}
    </Container>
  );
}
