/**
 * Copyright since 2007 PrestaShop SA and Contributors
 * PrestaShop is an International Registered Trademark & Property of PrestaShop SA
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.md.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to https://devdocs.prestashop.com/ for more information.
 *
 * @author    PrestaShop SA and Contributors <contact@prestashop.com>
 * @copyright Since 2007 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 */

import ProductMap from '@pages/product/product-map';
import Router from '@components/router';
import ConfirmModal from '@components/modal';

const {$} = window;

export default class FeatureValuesManager {
  constructor(featureValuesRoute) {
    this.router = new Router();
    this.featureValuesRoute = featureValuesRoute;
    this.$collectionContainer = $(ProductMap.featureValues.collectionContainer);

    this.watchFeatureSelectors();
    this.watchCustomInputs();
    this.watchDeleteButtons();
  }

  watchDeleteButtons() {
    $(this.$collectionContainer).on('click', ProductMap.featureValues.deleteFeatureValue, (event) => {
      const $deleteButton = $(event.currentTarget);
      const $collectionRow = $deleteButton.closest(ProductMap.featureValues.collectionRow);
      const modal = new ConfirmModal(
        {
          id: 'modal-confirm-delete-feature-value',
          confirmTitle: $deleteButton.data('modal-title'),
          confirmMessage: $deleteButton.data('modal-message'),
          confirmButtonLabel: $deleteButton.data('modal-apply'),
          closeButtonLabel: $deleteButton.data('modal-cancel'),
        },
        () => {
          $collectionRow.remove();
        },
      );
      modal.show();
    });
  }

  watchCustomInputs() {
    $(this.$collectionContainer).on('keyup change', ProductMap.featureValues.customValueInput, (event) => {
      const $changedInput = $(event.target);
      const $collectionRow = $changedInput.closest(ProductMap.featureValues.collectionRow);

      // Check if any custom inputs has a value
      let hasCustomValue = false;
      $(ProductMap.featureValues.customValueInput, $collectionRow).each((index, input) => {
        const $input = $(input);

        if ($input.val() !== '') {
          hasCustomValue = true;
        }
      });

      const $featureValueSelector = $(ProductMap.featureValues.featureValueSelect, $collectionRow).first();
      $featureValueSelector.prop('disabled', hasCustomValue);
      if (hasCustomValue) {
        $featureValueSelector.val('');
      }
    });
  }

  watchFeatureSelectors() {
    $(this.$collectionContainer).on('change', ProductMap.featureValues.featureSelect, (event) => {
      const $selector = $(event.target);
      const idFeature = $selector.val();
      const $collectionRow = $selector.closest(ProductMap.featureValues.collectionRow);
      const $featureValueSelector = $(ProductMap.featureValues.featureValueSelect, $collectionRow).first();
      const $customValueInputs = $(ProductMap.featureValues.customValueInput, $collectionRow);
      const $customFeatureIdInput = $(ProductMap.featureValues.customFeatureIdInput, $collectionRow);

      // Reset values
      $customValueInputs.val('');
      $featureValueSelector.val('');
      $customFeatureIdInput.val('');

      $.get(this.router.generate(this.featureValuesRoute, {idFeature}))
        .then((featureValuesData) => {
          $featureValueSelector.prop('disabled', featureValuesData.length === 0);
          $featureValueSelector.empty();
          $.each(featureValuesData, (index, featureValue) => {
            // The placeholder shouldn't be posted.
            if (featureValue.id === '0') {
              featureValue.id = '';
            }

            $featureValueSelector
              .append($('<option></option>')
                .attr('value', featureValue.id)
                .text(featureValue.value));
          });
        });
    });
  }
}
