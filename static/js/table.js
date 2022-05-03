$(async function () {
    //get html element with id table
    var $table = $("#table");

    //fetch language from json file
    var language = await fetch(`/locale`)
        .then(response => {
            if (response.ok) return response.json();
            //if error throw error
            else throw new Error(response.statusText);
        })
        .then(data => { return data });

    //get data from database
    var data = await fetch(`/api/organisasjoner`)
        .then(response => {
            if (response.ok) return response.json();
            //if error throw error
            else throw new Error(response.statusText);
        })
        .then(data => {
            //return data
            return data;
        });

    //function for expandable rows in table
    function viewDetail(d, t) {
        var th = "";
        var td = "";
        //if instsektorkode row is clicked show data
        if (t == "instsektorkode") {
            th += `<th>Instsektorkode</th><th>Beskrivelse</th>`;
            td += `<td>${d.instsektorkode}</td><td>${d.instsektorkode_beskrivelse}</td>`;
        }
        //if orgform row is clicked show orgform data
        else if (t == "orgform") {
            th += `<th>Organisasjons form</th><th>Beskrivelse</th>`;
            td += `<td>${d.orgformkode}</td><td>${d.orgformkode_beskrivelse}</td>`;
        }
        //if naeringskode row is clicked show naeringskode data
        else if (t == "naeringskode") {
            th += `<th>Næringskode</th><th>Beskrivelse</th>`;
            td += `<td>${d.naeringskode}</td><td>${d.naeringskode_beskrivelse}</td>`;
        }
        //return html when generated
        return `
        <table class="table table-striped display table-bordered">
        <thead><tr>${th}</tr></thead>
        <tbody><tr>${td}</tr></tbody></table>`;
    }
    //initiliaze table
    var dt = $table.DataTable({
        dom: 'Blfrtip',
        processing: true,
        data: data,
        language: language,
        columns: [
            { "data": "orgnr" },
            { "data": "navn" },
            { "data": "kommune_nr_id.kommune_navn" },
            { "data": "ansatte" },
            { "data": "stiftelsedato" },
            { "data": "regdato" },
            { "data": "slettedato" },
            { "data": "konkurs" },
            { "data": "under_avvikling" },
            { "data": "under_tvangsavvikling" },
            {
                "class": `details-control orgform`,
                "orderable": true,
                "data": "orgformkode_id.orgformkode",
            },
            {
                "class": "details-control instsektorkode",
                "orderable": true,
                "data": "instsektorkode_id.instsektorkode",
            },
            {
                "class": "details-control naeringskode",
                "orderable": true,
                "data": "naeringskode_id.naeringskode",
            },
        ],
        buttons: [
            {
                extend: 'collection',
                text: 'Export',
                buttons: [
                    {
                        extend: 'excelHtml5',
                        charset: 'UTF-8',
                        bom: true,
                        filename: 'Organisasjoner',
                        title: 'Organisasjoner'
                    },
                    {
                        extend: 'csv',
                        charset: 'UTF-8',
                        fieldSeparator: ',',
                        bom: true,
                        filename: 'Organisasjoner',
                        title: 'Organisasjoner'
                    },
                    {
                        extend: 'pdfHtml5',
                        download: 'open',
                        text: 'PDF',
                    },
                ]
            },
        ],
        "lengthChange": true,
        "lengthMenu": [[15, 30, 50, 100, 5000], [15, 30, 50, 100, "Alle"]],
        "pageLength": 15,
        aaSorting: [[1, "asc"]],
    });

    // Array to track the ids of the details displayed rows
    var detailRows = [];

    //function to show/hide collapsable rows
    $('#table tbody').on('click', 'tr td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = dt.row(tr);
        var idx = $.inArray(tr.attr('id'), detailRows);

        if (row.child.isShown()) {
            tr.removeClass('details');
            row.child.hide();

            // Remove from the 'open' array
            detailRows.splice(idx, 1);
        }
        else {
            tr.addClass('details');
            if ($(this).hasClass("orgform")) row.child(viewDetail(row.data().orgformkode_id, "orgform")).show();
            if ($(this).hasClass("instsektorkode")) row.child(viewDetail(row.data().instsektorkode_id, "instsektorkode")).show();
            if ($(this).hasClass("naeringskode")) row.child(viewDetail(row.data().naeringskode_id, "naeringskode")).show();

            // Add to the 'open' array
            if (idx === -1) {
                detailRows.push(tr.attr('id'));
            }
        }
    });

    // On each draw, loop over the `detailRows` array and show any child rows
    dt.on('draw', function () {
        $.each(detailRows, function (i, id) {
            $('#' + id + ' td.details-control').trigger('click');
        });
    });

});
