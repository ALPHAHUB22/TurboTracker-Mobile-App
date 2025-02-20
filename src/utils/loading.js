import { Loading, QSpinnerIos } from 'quasar';

export function showLoading() {
  Loading.show({
    spinner: QSpinnerIos,
    spinnerColor: 'blue',
    spinnerSize: 40,
    backgroundColor: 'white',
  });
}

export function hideLoading() {
  Loading.hide();
}
