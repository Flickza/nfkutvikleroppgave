//import language
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
        .then(data => {return data});

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
        //if status row is clicked show status data
        if (t == "status") {
            th += `<th>Konkurs</th><th>Under Avvikling</th><th>Under Tvangsavvikling</th>`;
            td += `<td>${d.konkurs}</td><td>${d.under_avvikling}</td><td>${d.under_tvangsavvikling}</td>`;
        }
        //if instsektorkode row is clicked show data
        else if (t == "instsektorkode") {
            th += `<th>Instsektorkode</th><th>Beskrivelse</th>`;
            td += `<td>${d.instsektorkode}</td><td>${d.instsektorkode_beskrivelse}</td>`;
        }
        //if orgform row is clicked show orgform data
        else if (t == "orgform") {
            th += `<th>orgform</th><th>Beskrivelse</th>`;
            td += `<td>${d.orgformkode}</td><td>${d.orgformkode_beskrivelse}</td>`;
        }
        //if naeringskode row is clicked show naeringskode data
        else if (t == "naeringskode") {
            th += `<th>Næringskode</th><th>Beskrivelse</th>`;
            td += `<td>${d.naeringskode}</td><td>${d.naeringskode_beskrivelse}</td>`;
        }
        //return html when generated
        return `<table class="table display">
        <thead>
        <tr>
        ${th}
        </tr>
        </thead>
        <tbody>
        <tr>
        ${td}
        </tr>
        </tbody>
        </table>`;
    }
    //initiliaze table
    var dt = $table.DataTable({
        processing: true,
        data: data,
        language: language,
        columns: [

            { "data": "orgnr" },
            { "data": "navn" },
            { "data": "ansatte" },
            { "data": "kommune_nr_id.kommune_navn" },
            {
                "class": `details-control orgform`,
                "orderable": false,
                "data": "orgformkode_id.orgformkode",
            },
            {
                "class": "details-control instsektorkode",
                "orderable": false,
                "data": "instsektorkode_id.instsektorkode",
            },
            {
                "class": "details-control naeringskode",
                "orderable": false,
                "data": "naeringskode_id.naeringskode",
            },
            { "data": "stiftelsedato" },
            { "data": "regdato" },
            {
                "class": "details-control status",
                "orderable": false,
                "data": "status.text",
            },
        ],
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
            if ($(this).hasClass("status")) row.child(viewDetail(row.data().status, "status")).show();
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
