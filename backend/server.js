const express = require("express");
const sql = require("mssql/msnodesqlv8");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const config = {
    connectionString:
        "Driver={ODBC Driver 17 for SQL Server};Server=localhost\\SQLEXPRESS;Database=CinemaBookingSystem;Trusted_Connection=yes;"
};



// CONNECT SQL SERVER
sql.connect(config)
.then(() => {
    console.log("Connected To SQL Server");
})
.catch(err => {
    console.log(err);
});


// GET SEATS
app.get("/seats", async (req, res) => {

    try {

        const result = await sql.query(`
    SELECT 
        s.SeatID,
        s.SeatNumber,

        CASE
            WHEN b.SeatID IS NOT NULL THEN 'booked'
            ELSE 'available'
        END AS Status

    FROM Seats s

    LEFT JOIN Bookings b
    ON s.SeatID = b.SeatID
`);

        res.json(result.recordset);

    } catch(err) {

        console.log(err);

    }

});

app.post("/book", async (req, res) => {

    try {

        const { seatId } = req.body;

        const checkSeat = await sql.query(`
    SELECT *
    FROM Bookings
    WHERE SeatID = ${seatId}
`);

if(checkSeat.recordset.length > 0){

    return res.status(400).json({
        message: "Seat already booked"
    });

}

await sql.query(`
    INSERT INTO Bookings (CustomerID, ShowtimeID, SeatID)
    VALUES (1,1,${seatId})
`);

        res.json({
            message: "Booked Successfully"
        });

    } catch(err){

        console.log(err);

        res.status(500).json({
            message: "Seat already booked"
        });

    }

});
// START SERVER
app.listen(3000, () => {

    console.log("Server Running On Port 3000");

});
