// import React from 'react'

import type { AdminLoginData } from "../../interface/Interface";
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { closeLoading, showError, showLoading, showSuccessDialog } from "../../utilities/Alert";
import axios from "axios";
import { useEffect } from "react";

const getInitialValues = (): AdminLoginData => ({
    username: "",
    password: "",
});

function LoginAdmin() {
    const apiURL = import.meta.env.VITE_API_URL
    const adminAPI = `${apiURL}/admin`

    useEffect(() => {
        async function fetchData() {
            const token = localStorage.getItem('token-admin')

            if (token) {
                const res = (await axios.get(`${adminAPI}/get/auth/verify/token`, {
                    headers: { Authorization: `Bearer ${token}` }
                })).data
            
                if (res.success) window.location.href = "/admin/cashier"
                else localStorage.removeItem('token-admin')
            }
        }

        fetchData()
    }, [])

    const initialValues = getInitialValues();

    const validationSchema = Yup.object().shape(
        {
            username: Yup.string().required("*Required"),
            password: Yup.string().required("*Required")
        });

    const onSubmit = (values: AdminLoginData) => {
        showLoading()

        axios.post(`${adminAPI}/post/auth/login`, values).then(res => {
            closeLoading()
            if (!res.data.success) {
                showError(res.data.message)
                return
            }
            localStorage.setItem('token-admin', res.data.token)
            showSuccessDialog(res.data.message, 'Masuk', () => {
                window.location.href = "/admin/cashier"
            })
        }).catch(() => {
            closeLoading()
            showError("Terjadi kesalahan saat login.")
        })
    }

    return (
        <div className='loginAdminContainer'>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
            >
                <Form className='adminForm'>
                    <h1> Welcome </h1>
                    <ErrorMessage name='username' component="span" className='errMessage' />
                    <Field
                        className="adminInput"
                        name="username"
                        placeholder="username"
                    />
                    <ErrorMessage name='password' component="span" className='errMessage' />
                    <Field
                        className="adminInput"
                        name="password"
                        placeholder="password"
                        type="password"
                    />
                    <button type='submit'> Login </button>
                </Form>
            </Formik>
        </div>
    )
}

export default LoginAdmin
