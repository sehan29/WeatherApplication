import { useAuth0 } from '@auth0/auth0-react'
import { useLocation } from 'react-router-dom'
import Brand from './Brand'
import { ArrowIcon } from './Icons'

export default function LoginScreen({ authError }) {
    const { loginWithRedirect } = useAuth0()
    const location = useLocation()
    const returnTo = location.state?.from?.pathname || '/dashboard'

    return (
        <main className="login-redesign">

            <br />
            <br />
            <section className="login-redesign__content">
                <p className="login-redesign__eyebrow">Live Weather Analytics</p>
                <h1>
                    See where the weather
                    <em> feels better.</em>
                </h1>

                {authError && (
                    <p className="login-redesign__error" role="alert">{authError.message}</p>
                )}

                <br />

                <button
                    className="login-redesign__button"
                    type="button"
                    onClick={() => loginWithRedirect({ appState: { returnTo } })}
                >
                    Sign in to dashboard
                    <ArrowIcon />
                </button>
            </section>


        </main>
    )
}
