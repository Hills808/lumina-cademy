import { useState } from "react";
import PlotTwist from "@/components/PlotTwist";
import Navbar from "@/components/Navbar";
import Home from "./Home";

/**
 * Componente Index - Página principal do LUMINA
 * Controla a exibição do PlotTwist e depois mostra o site completo
 */
const Index = () => {
  const [showPlotTwist, setShowPlotTwist] = useState(true);

  if (showPlotTwist) {
    return <PlotTwist onComplete={() => setShowPlotTwist(false)} />;
  }

  return (
    <>
      <Navbar />
      <Home />
    </>
  );
};

export default Index;
