import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "./store/auth";
import PageLoader from "./components/PageLoader.jsx";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  if (isLoading) {
    return <PageLoader fullScreen label="Loading app..." />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
