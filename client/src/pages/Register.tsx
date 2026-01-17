// import React from 'react'
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from 'axios';
import { showLoading, closeLoading, showError, showSuccessDialog } from "../utilities/Alert";
import LoginAccess from "../components/utils/LoginAccess";
import type { RegisterData } from "../interface/Interface";



const getInitialValues = (): RegisterData => ({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
})

function Register() {
    const apiURL = import.meta.env.VITE_API_URL
    const usersAPI = `${apiURL}/users`

    const initialValues = getInitialValues();

    const validationSchema = Yup.object().shape(
        {
            name: Yup.string().min(3, '*Must be at least 3 characters').required('*Required').max(20, '*Must be 20 characters or less'),
            email: Yup.string().email('*Invalid email format').required('*Required'),
            password: Yup.string().min(8, '*Must be at least 8 characters').max(20, '*Must be 20 characters or less').required('*Required'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('password'), undefined], '*Passwords must match')
                .required('*Required')
        });

    const onSubmit = (values: RegisterData) => {
        showLoading()

        axios.post(`${usersAPI}/post/auth/create-account`, values)
            .then(res => {
                closeLoading()
                if (!res.data.success) {
                    showError(res.data.message)
                    return
                }
                showSuccessDialog(res.data.message, 'Cek Email', (result) => {
                    if (result.isConfirmed) {
                        openGmail()
                    }
                })
            })
            .catch(() => {
                closeLoading()
                showError("Terjadi kesalahan saat membuat akun.")
            })
    }

    const openGmail = () => {
        window.open("https://mail.google.com/", "_blank");
    };

    return (
        <div className='authContainer'>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
            >
                <Form className='authBox'>
                    <h1> Register </h1>
                    <ErrorMessage name='name' component="span" className='errMessage' />
                    <Field
                        className="authField"
                        name="name"
                        placeholder="name"
                    />
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
                    <ErrorMessage name='confirmPassword' component="span" className='errMessage' />
                    <Field
                        className="authField"
                        name="confirmPassword"
                        placeholder="confirm password"
                        type="password"
                    />
                    <div className='linksBox'>
                        <p></p>
                        <a href='/auth/login'> Sudah punya akun? Masuk </a>
                    </div>

                    <button type='submit' className='authButton'> Register </button>
                    <a href='/'> Lanjut tanpa login </a>
                </Form>
            </Formik>
            <LoginAccess />
        </div>
    )
}

export default Register
