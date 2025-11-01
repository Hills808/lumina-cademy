import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PlotTwist from "@/components/PlotTwist";
import Navbar from "@/components/Navbar";
import Home from "./Home";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

/**
 * Componente Index - Página principal do LUMINA
 * Primeiro mostra uma página simples "feita às pressas"
 * Quando clicar em Login ou Cadastrar, ativa o PlotTwist
 */
const Index = () => {
  const [showPlotTwist, setShowPlotTwist] = useState(false);
  const [showRealSite, setShowRealSite] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o usuário está logado
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Redireciona para o dashboard se estiver logado
        navigate("/dashboard");
      }
    };
    checkAuth();
  }, [navigate]);

  // Função chamada quando usuário clica em Login ou Cadastrar
  const handleButtonClick = () => {
    setShowPlotTwist(true);
  };

  // Função chamada quando a animação do PlotTwist termina
  const handlePlotTwistComplete = () => {
    setShowPlotTwist(false);
    setShowRealSite(true);
  };

  // Mostra a animação do PlotTwist
  if (showPlotTwist) {
    return <PlotTwist onComplete={handlePlotTwistComplete} />;
  }

  // Mostra o site completo após a animação
  if (showRealSite) {
    return (
      <>
        <Navbar />
        <Home />
      </>
    );
  }

  // Página inicial simples - parece "feita às pressas"
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded shadow-sm max-w-md w-full text-center border border-gray-300">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">LUMINA</h1>
        <p className="text-gray-600 mb-6">Plataforma Acadêmica</p>
        
        <div className="space-y-3">
          <Button 
            onClick={handleButtonClick}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            Login
          </Button>
          <Button 
            onClick={handleButtonClick}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cadastrar
          </Button>
        </div>

        <p className="text-xs text-gray-400 mt-6">© 2025 LUMINA</p>
      </div>
    </div>
  );
};

export default Index;
