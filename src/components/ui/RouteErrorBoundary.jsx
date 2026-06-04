import { Component } from "react";
import Icon from "./Icon";

export default class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch() {
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-white p-6 dark:bg-[#0b1220]">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fef2f2] dark:bg-[#3c1116]">
              <Icon className="text-3xl text-[#dc2626]" name="error" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-[#183325] dark:text-[#f8fafc]">Algo salio mal</h2>
            <p className="mb-6 text-sm text-[#5b6d61] dark:text-[#c7d2e0]">
              Ocurrio un error al cargar esta seccion. Intenta de nuevo.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1f7a3a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#166534]"
              type="button"
            >
              <Icon name="refresh" />
              Recargar pagina
            </button>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-xs text-[#5b6d61]">Ver detalle del error</summary>
              <pre className="mt-2 max-h-32 overflow-auto rounded border border-[#e4ece2] bg-[#f8faf6] p-3 text-xs text-[#dc2626] dark:border-[#23314d] dark:bg-[#111827]">
                {this.state.error?.message}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
