import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); 
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
    
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('Usuario registrado con éxito!');
        alert('Registro exitoso! Ya puedes iniciar sesión.');
        setIsRegistering(false); 
        setEmail('');
        setPassword('');
      } else {
       
        await signInWithEmailAndPassword(auth, email, password);
        console.log('Sesión iniciada con éxito!');
        navigate('/'); 
      }
    } catch (err) {
      console.error(err.message);
      let errorMessage = 'Ocurrió un error. Inténtalo de nuevo.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'El correo electrónico ya está en uso.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'El correo electrónico no es válido.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Credenciales inválidas. Verifica tu email y contraseña.';
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">
                {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
              </h2>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleAuth}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 mb-3">
                  {isRegistering ? 'Registrar' : 'Iniciar Sesión'}
                </button>
              </form>
              <p className="text-center">
                {isRegistering ? (
                  <>
                    ¿Ya tienes cuenta?{' '}
                    <button className="btn btn-link p-0" onClick={() => setIsRegistering(false)}>
                      Inicia Sesión
                    </button>
                  </>
                ) : (
                  <>
                    ¿No tienes cuenta?{' '}
                    <button className="btn btn-link p-0" onClick={() => setIsRegistering(true)}>
                      Regístrate
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;