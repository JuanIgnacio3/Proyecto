import { Link } from 'react-router';
import CardBox from 'src/components/shared/CardBox';
import AuthLogin from '../authforms/AuthLogin';
import FullLogo from 'src/layouts/full/shared/logo/FullLogo';

const Login = () => {
  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-lightprimary px-4 dark:bg-darkprimary">
      <CardBox className="w-full border-none md:w-[450px]">
        <div className="mx-auto mb-6 flex justify-center">
          <FullLogo />
        </div>
        <div className="mb-2 text-center">
          <h1 className="text-xl font-semibold">Portal institucional</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingresá con tu correo institucional para acceder al panel.
          </p>
        </div>
        <AuthLogin />
        <div className="mt-6 text-center">
          <Link to="/inicio" className="text-sm font-medium text-primary">
            Volver al sitio del colegio
          </Link>
        </div>
      </CardBox>
    </div>
  );
};

export default Login;
