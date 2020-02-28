import $ from 'jquery'
import 'jquery-ui/ui/widgets/slider'
import 'jquery-ui/themes/base/slider.css';
import 'jquery-ui/themes/base/theme.css';

const thisId = '#test-range'

$(function () {
    $(`${thisId} .range-slider`).slider({
        range: true,
        min: 1000,
        max: 15000,
        values: [5000, 10000],
        slide: function (event, ui) {
            $(`${thisId} .range-value`).val(ui.values[0] + "₽" + ' - ' + ui.values[1] + '₽')
        }
    })
    $(`${thisId} .range-value`).val($(`${thisId} .range-slider`).slider("values", 0) + '₽' + ' - ' + $(`${thisId} .range-slider`).slider("values", 1) + '₽')
})

