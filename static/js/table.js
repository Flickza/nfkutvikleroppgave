
$(async function () {
    //get html element with id table
    var $table = $("#table");

    //filter for ansatte between x, y
    $.fn.dataTable.ext.search.push(
        function (settings, data, dataIndex) {
            var min = parseInt($('#ansatteMin').val(), 10);
            var max = parseInt($('#ansatteMax').val(), 10);
            var ansatte = parseFloat(data[3]) || 0; // use data for the ansatte column

            if ((isNaN(min) && isNaN(max)) ||
                (isNaN(min) && ansatte <= max) ||
                (min <= ansatte && isNaN(max)) ||
                (min <= ansatte && ansatte <= max)) {
                return true;
            }
            return false;
        }
    );

    //create search fields for each column
    $('#table thead tr.sFields th').each(function () {
        var title = $(this).text();
        $(this).html('<input type="text" class="form-control form-control-sm column_search" placeholder="Søk ' + title + '" />');
    });

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
        <table class="table display table-bordered">
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
                extend: 'colvis',
                columns: ':not(.noVis)',
                postfixButtons: ['colvisRestore'],
            },
            {
                extend: 'collection',
                text: 'Eksport',
                buttons: [
                    {
                        extend: 'excelHtml5',
                        charset: 'UTF-8',
                        bom: true,
                        filename: 'Organisasjoner',
                        title: 'Organisasjoner',
                        exportOptions: {
                            columns: ":visible",
                        }
                    },
                    {
                        extend: 'csv',
                        charset: 'UTF-8',
                        fieldSeparator: ',',
                        bom: true,
                        filename: 'Organisasjoner',
                        title: 'Organisasjoner',
                        exportOptions: {
                            columns: ":visible",
                        }
                    },
                    {
                        extend: 'pdfHtml5',
                        download: 'open',
                        text: 'PDF',
                        orientation: 'landscape',
                        pageSize: 'A3',
                        exportOptions: {
                            columns: ":visible",
                        }
                    },
                ]
            },
        ],
        "lengthChange": true,
        "lengthMenu": [[10, 30, 50, 100, 5000], [10, 30, 50, 100, "Alle"]],
        "pageLength": 10,
        aaSorting: [[1, "asc"]],
        columnDefs: [
            {
                targets: 1,
                className: 'noVis'
            }
        ],
    });

    //individual column search handler
    $('#table thead').on('keyup', ".column_search", function () {
        dt
            .column($(this).parent().index())
            .search(this.value)
            .draw();
    });

    //fill "kommune" search list with unique kommune names sorted alphabetically
    dt.column(2).data().unique().sort().each(function (d, j) {
        $("#kommuneCategories").append(`<option value="${d}">${d}</option>`);
    });

    //fill "organisasjonsform" search list with unique organisasjonsforms sorted alphabetically
    dt.column(10).data().unique().sort().each(function (d, j) {
        $("#orgformCategories").append(`<option value="${d}">${d}</option>`);
    });

    //fill "Naeringskode" search list with unique naeringskoder sorted Ascending
    dt.column(12).data().unique().sort().each(function (d, j) {
        $("#naeringskodeCategories").append(`<option value="${d}">${d}</option>`);
    });

    //make select dropdown search when an option is selected
    $("#kommuneCategories").on("change", function () {
        console.log(this.value);
        dt.column(2).search(this.value).draw();
    });
    $("#orgformCategories").on("change", function () {
        console.log(this.value);
        dt.column(10).search(this.value).draw();
    });
    $("#naeringskodeCategories").on("change", function () {
        console.log(this.value);
        dt.column(12).search(this.value).draw();
    });

    //filter date
    $(function () {
        $('#regyearStart').daterangepicker({
            locale: {
                format: 'YYYY-MM-DD'
            },
            "singleDatePicker": true,
            "showDropdowns": true,
            "startDate": "1950-01-01",
            "endDate": "2022-01-01",
        }, function (start, end, label) {
            $("#regyearStart").val(start.format('YYYY-MM-DD'));
        });
        $('#regyearEnd').daterangepicker({
            locale: {
                format: 'YYYY-MM-DD'
            },
            "singleDatePicker": true,
            "showDropdowns": true,
            "startDate": "2022-01-01",
            "endDate": "2023-01-01",
        }, function (start, end, label) {
            $("#regyearEnd").val(start.format('YYYY-MM-DD'));
        });
    });

    //work in progress
    // $("#regyearStart, #regyearEnd").on('change', function () {
    //     var minDate = $('#regyearStart').val();
    //     var maxDate = $('#regyearEnd').val();
    //     console.log(minDate, maxDate);
    //     // Custom filtering function which will search data in column four between two values
    //     $.fn.dataTable.ext.search.push(
    //         function (settings, data, dataIndex) {
    //             var min = "2019-06-13";
    //             var max = "2020-06-13";
    //             var date = new Date(data[5]);

    //             if (
    //                 (min === null && max === null) ||
    //                 (min === null && date <= max) ||
    //                 (min <= date && max === null) ||
    //                 (min <= date && date <= max)
    //             ) {
    //                 return true;
    //             }
    //             return false;
    //         }
    //     );
    //     dt.draw();
    // });
    //filter ansatte between (not finished)
    $('#ansatteMin, #ansatteMax').on('keyup', function () {
        dt.draw();
    });




    //export buttons to custom toolbar element
    dt.buttons().container().appendTo('.toolbarexport');
    $('#table_filter').detach().appendTo('.toolbarfilter');

    //set css of exported buttons
    $(".toolbarfilter").find("label").css("width", "100%");

    //modify classes from DataTables library
    $(".toolbarfilter").find("input").removeClass("form-control-sm");
    $(".toolbarfilter").find("input").attr("placeholder", "Søk i alle rader...");

    //set css of export button
    $(".toolbarexport").find("button").addClass("ml-1");


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
            //check what row is clicked to give the right view data
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


    //reset search filters button
    $("#resetFilters").on("click", function () {
        dt.columns().search('').draw();
        $("#kommuneCategories").val("");
        $("#orgformCategories").val("");
        $("#naeringskodeCategories").val("");
        $("#regyearStart").val("1950-01-01");
        $("#regyearEnd").val("2022-01-01");
        $("#ansatteMin").val(0);
        $("#ansatteMax").val(50000);
        $("#ansatteMin").trigger("change");
        $("#ansatteMax").trigger("change");
        dt.order([1, 'asc']).draw();
    }
    );
});