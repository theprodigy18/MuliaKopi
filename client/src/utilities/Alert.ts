import Swal, { type SweetAlertResult } from 'sweetalert2';

export const showWarning = (message: string) => {
    Swal.fire({
        icon: 'warning',
        title: 'Peringatan',
        text: message,
        showConfirmButton: false,
        showCloseButton: true,
        timer: 1500,
        toast: true,
        timerProgressBar: true,
        position: 'top'
    });
};

export const showError = (message: string) => {
    Swal.fire({
        icon: 'error',
        title: 'Terjadi Kesalahan',
        text: message,
        showConfirmButton: false,
        showCloseButton: true,
        timer: 1500,
        toast: true,
        timerProgressBar: true,
        position: 'top'
    });
};

export const showSuccess = (message: string) => {
    Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: message,
        showConfirmButton: false,
        showCloseButton: true,
        timer: 1500,
        toast: true,
        timerProgressBar: true,
        position: 'top'
    });
};

export const showSuccessDialog = (
    message: string,
    confirmButtonText: string,
    onClose?: (result: SweetAlertResult) => void) => {
    Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: message,
        showConfirmButton: true,
        confirmButtonText: confirmButtonText,
        allowOutsideClick: true,
    }).then((result) => {
        if (onClose) onClose(result);
    });
}

export const showLoading = () => {
    Swal.fire({
        title: 'Mengirim data...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

export const closeLoading = () => {
    Swal.close();
}

