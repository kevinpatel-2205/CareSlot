import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <section className="glass-card w-full max-w-xl p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5b7fb8]">Error 404</p>
        <h2 className="mt-2 font-['Averia_Serif_Libre'] text-5xl font-semibold text-[#1a3f7b]">Page Not Found</h2>
        <p className="mt-3 text-[#48679e]">The page you are looking for does not exist or has been moved.</p>
        <Link
          to="/login"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#2d7cf2] to-[#266fdf] px-5 font-semibold text-white"
        >
          Go To Dashboard
        </Link>
      </section>
    </div>
  );
}

export default NotFoundPage;
