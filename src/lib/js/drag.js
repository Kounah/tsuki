document.addEventListener('DOMContentLoaded', function() {
  window.addEventListener('drag', function(ev) { ev.preventDefault(); });

  /**@type {Array.<HTMLDivElement>} */
  let dragTargets = Array.prototype.slice.call(document.querySelectorAll('.drag-target'));

  dragTargets.forEach(function(dragTarget) {
    let input = dragTarget.querySelector('input');
    let preview = dragTarget.querySelector('.preview');

    dragTarget.addEventListener('click', function() {
      input.click();

      input.addEventListener('change', function() {
        let reader = new FileReader();

        reader.addEventListener('load', function(ev) {
          preview.src = ev.target.result;
        });

        reader.readAsDataURL(input.files.item(0));
      });
    });

    function handleBeginDrag(ev) {
      ev.preventDefault();
      dragTarget.classList.add('-drag');
    }

    function handleFinishDrag(ev) {
      ev.preventDefault();
      dragTarget.classList.remove('-drag');
    }

    dragTarget.addEventListener('dragenter', handleBeginDrag);
    dragTarget.addEventListener('dragover', handleBeginDrag);

    dragTarget.addEventListener('dragleave', handleFinishDrag);
    dragTarget.addEventListener('dragend', handleFinishDrag);
    dragTarget.addEventListener('drop', handleFinishDrag);

    dragTarget.addEventListener('drop', function(ev) {
      dragTarget.classList.add('-drop');
      let file = ev.dataTransfer.files.item(0);
      console.log(file);

      let reader = new FileReader();

      reader.addEventListener('load', function(ev) {
        preview.src = ev.target.result;
        preview.classList.remove('hidden');
        dragTarget.classList.remove('-drop');
      });

      reader.readAsDataURL(file);

    });
  });
});