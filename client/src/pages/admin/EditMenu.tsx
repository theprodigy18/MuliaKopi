// import React from 'react'

import { useEffect, useState } from "react"
import { VerifyTokenAdmin } from "../../utilities/VerifiyToken"
import type { Admin, MenuData } from "../../interface/Interface"
import Loading from "../../components/Loading"
import HeaderAdmin from "../../components/admin/HeaderAdmin"
import SidebarAdmin from "../../components/admin/SidebarAdmin"
import { useParams } from "react-router-dom"
import axios from "axios"
import * as Yup from 'yup'
import { ErrorMessage, Field, Formik, Form } from "formik"
import { closeLoading, showError, showLoading, showSuccessDialog } from "../../utilities/Alert"

interface MenuForm {
    name: string,
    category: string,
    image: File | null,
    description: string,
    price: number
}

function EditMenu() {
    const apiURL = import.meta.env.VITE_API_URL
    const imageURL = import.meta.env.VITE_API_IMAGE_URL
    const menuAPI = `${apiURL}/menu`
    const productAPI = `${imageURL}/products`
    const { menuId } = useParams()
    const uploadImagesAPI = `${apiURL}/upload-images`
    const [adminData, setAdminData] = useState<Admin>()
    const [loading, setLoading] = useState(true)
    const [image, setImage] = useState<File | null>(null)
    const [prevImage, setPrevImage] = useState<File | null>(null)
    const [menu, setMenu] = useState<MenuData>()

    useEffect(() => {
        if (!menuId) {
            window.location.href = '/'
            return
        }

        async function fetchData() {
            await VerifyTokenAdmin(setAdminData)

            const res = (await axios.get(`${menuAPI}/get/by-id/${menuId?.toUpperCase()}`)).data

            if (res.success) {
                setMenu(res.menu)
                const image = await fetch(`${productAPI}/${res.menu.image}`);
                const blob = await image.blob();
                const file = new File([blob], res.menu.image, { type: blob.type });
                setImage(file)
                setPrevImage(file)
            }
            else {
                window.location.href = '/'
                return
            }

            setLoading(false)
        }

        fetchData()
    }, [])

    if (loading) return <Loading />

    const initialValues: MenuForm = {
        name: menu?.name || "",
        category: menu?.category || "",
        image: image || null,
        description: menu?.description || "",
        price: menu?.price || 0
    }

    const validationSchema = Yup.object().shape(
        {
            category: Yup.string().required("*Required"),
            name: Yup.string().required("*Required"),
            image: Yup.mixed()
                .required('*Required')
                .test('fileType', '*File yang diunggah harus berupa gambar', (value) => {
                    const file = value as File;
                    return file && file.type.startsWith('image/');
                }),
            description: Yup.string().required("*Required"),
            price: Yup.number().min(1000, "*Harga minimal 1000").required("*Required"),
        });


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return null;
        const file = e.target.files[0];
        const newFileName = Date.now() + "_" + file.name; // Nama baru yang ingin Anda gunakan

        // Anda bisa menyimpan file dengan nama baru dalam state
        const renamedFile = new File([file], newFileName, { type: file.type });

        return renamedFile;
    };

    const uploadImage = async (formData: FormData) => {
        try {
            const response = (await axios.post(`${uploadImagesAPI}/post/product`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data;

            return response;
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }


    const onSubmit = async (values: MenuForm) => {
        
        showLoading()
        if (prevImage !== values.image) {
            const formData = new FormData();
            formData.append('image', values.image as File);
            const upload = await uploadImage(formData)

            if (!upload.success) {
                closeLoading()
                showError(upload.message)
                return
            }
        }

        const menuData = {
            name: values.name,
            category: values.category,
            image: values.image?.name,
            description: values.description,
            price: values.price
        }

        const res = (await axios.put(`${menuAPI}/put/edit-menu/by-id/${menuId?.toUpperCase()}`, menuData)).data
        
        if (!res.success) {
            if (prevImage !== values.image) await axios.delete(`${uploadImagesAPI}/delete/product/${values.image?.name}`)
            closeLoading()
            showError(res.message)
            return
        }
        else {
            if (prevImage !== values.image) await axios.delete(`${uploadImagesAPI}/delete/product/${prevImage?.name}`)
            closeLoading()
            showSuccessDialog(res.message, 'Ok', () => {
                window.location.href = "/admin/menu-management"
            })
        }


    }

    return (
        <div>
            <HeaderAdmin name={adminData?.name || ""} />
            <div className='actionOnMenuContainer'>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                >
                    {({ setFieldValue }) => (
                        <Form className='formMenu'>
                            <h1> {menu?.name} </h1>
                            <ErrorMessage name='category' component="span" className='errMessage' />
                            <div className='formInputContainer'>
                                <label> Kategori </label>
                                <Field as="select" name="category" className="formInput" disabled>
                                    <option value=""> Pilih Kategori </option>
                                    <option value="kopi"> Kopi </option>
                                    <option value="non-kopi"> Non Kopi </option>
                                    <option value="makanan"> Makanan </option>
                                </Field>
                            </div>
                            <ErrorMessage name='name' component="span" className='errMessage' />
                            <div className='formInputContainer'>
                                <label> Nama Menu </label>
                                <Field type="text" name="name" className="formInput" />
                            </div>
                            <ErrorMessage name='image' component="span" className='errMessage' />
                            {image && (
                                <img src={URL.createObjectURL(image)} alt="Gambar" className="gambarPreview" />
                            )}
                            <div className='formInputContainer'>
                                <label> Gambar </label>
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    className="formInput"
                                    onChange={(e) => {
                                        if (!e.target.files || e.target.files.length === 0) return null;
                                        setImage(e.target.files[0]);
                                        const newFile = handleFileChange(e);
                                        setFieldValue("image", newFile);
                                    }}
                                />
                            </div>
                            <ErrorMessage name='description' component="span" className='errMessage' />
                            <div className='formInputContainer'>
                                <label> Detail Menu </label>
                                <Field as="textarea" rows={5} name="description" className="formInput textarea" />
                                <style>
                                    {`
                                        .textarea {
                                            height: 150px !important; 
                                        }
                                    `}
                                </style>
                            </div>
                            <ErrorMessage name='price' component="span" className='errMessage' />
                            <div className='formInputContainer'>
                                <label> Harga </label>
                                <Field type="number" name="price" className="formInput" />
                            </div>

                            <div className='submitContainer'>
                                <button type='submit'> Simpan Menu </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
            <SidebarAdmin />
        </div>
    )
}

export default EditMenu
