import Swal from 'sweetalert2';

const SweetAlert = {
  showLoading() {
    Swal.fire({
      title: 'Memproses...',
      text: 'Harap tunggu sebentar.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  },

  showSuccess(message) {
    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: message,
    });
  },

  showError(message) {
    Swal.fire({
      icon: 'error',
      title: 'Oops... Terjadi Kesalahan',
      text: message,
    });
  },

  close() {
    Swal.close();
  },
};

export default SweetAlert;