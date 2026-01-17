// import React from 'react'

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from 'axios'
import { closeLoading, showError, showLoading, showSuccessDialog } from "../utilities/Alert";
import LoginAccess from "../components/utils/LoginAccess";
import type { LoginData } from "../interface/Interface";



const getInitialValues = (): LoginData => ({
    email: '',
    password: ''
});

function Login() {
    const apiURL = import.meta.env.VITE_API_URL
    const usersAPI = `${apiURL}/users`

    const initialValues = getInitialValues();

    const validationSchema = Yup.object().shape(
        {
            email: Yup.string().email('*Invalid email format').required('*Required'),
            password: Yup.string().min(8, '*Must be at least 8 characters').max(20, '*Must be 20 characters or less').required('*Required')
        });

    const onSubmit = (values: LoginData) => {
        showLoading()

        axios.post(`${usersAPI}/post/auth/login`, values)
            .then(res => {
                closeLoading()
                if (!res.data.success) {
                    showError(res.data.message)
                    return
                }
                localStorage.setItem('token', res.data.token)
                showSuccessDialog(res.data.message, 'Beranda', () => {
                    window.location.href = "/"
                })
            })
            .catch(() => {
                closeLoading()
                showError("Terjadi kesalahan saat login.")
            })
    }

    return (
        <div className='authContainer'>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
            >
                <Form className='authBox'>
                    <h1> Login </h1>
                    <ErrorMessage name='email' component="span" className='errMessage' />
                    <Field
                        className="authField"
                        name="email"
                        placeholder="email"
                    />
                    <ErrorMessage name='password' component="span" className='errMessage' />
                    <Field
                        className="authField"
                        name="password"
                        placeholder="password"
                        type="password"
                    />

                    <div className='linksBox'>
                        <a href='/lupa-password'> Lupa password? </a>
                        <a href='/auth/register'> Belum punya akun? Daftar </a>
                    </div>

                    <button type='submit' className='authButton'> Login </button>
                    <a href='/'> Lanjut tanpa login </a>
                </Form>
            </Formik>
            <LoginAccess />
        </div>
    )
}

export default Login
