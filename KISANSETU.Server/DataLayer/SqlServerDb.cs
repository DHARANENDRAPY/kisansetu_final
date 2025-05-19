using System.Data;
using Microsoft.Data.SqlClient;
namespace KISANSETU.Server.DataLayer
{
    public class SqlServerDb
    {
        public string conn = string.Empty;
        public SqlServerDb()
        {
            var connString = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build().GetSection("ConnectionStrings")["Development"];
            conn = Convert.ToString(connString);
        }

        public DataTable selectOperation(string storedProcedureName)
        {
            using (SqlConnection con = new SqlConnection(conn))
            {
                con.Open();
                using (SqlCommand cmd = new SqlCommand(storedProcedureName, con))
                {
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    SqlDataAdapter adapter = new SqlDataAdapter(cmd);
                    DataTable dt = new DataTable();
                    adapter.Fill(dt);
                    return dt;
                }
            }
        }

        public DataTable selectOperationForId(string storedProcedureName, SqlParameter[] parameters = null)
        {
            using (SqlConnection con = new SqlConnection(conn))
            {
                con.Open();
                using (SqlCommand cmd = new SqlCommand(storedProcedureName, con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;

                    if (parameters != null)
                    {
                        cmd.Parameters.AddRange(parameters);
                    }

                    using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adapter.Fill(dt);
                        return dt;
                    }
                }
            }
        }
        public (DataTable, DataTable) SelectOrdersWithItems(string procedureName, SqlParameter[] parameters)
        {
            using (SqlConnection con = new SqlConnection(conn)) // <-- fixed here
            using (SqlCommand cmd = new SqlCommand(procedureName, con))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddRange(parameters);

                con.Open();

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    DataTable ordersTable = new DataTable();
                    DataTable itemsTable = new DataTable();

                    ordersTable.Load(reader); // load first result set (orders)

                    if (reader.NextResult()) // move to second result set (items)
                    {
                        itemsTable.Load(reader);
                    }

                    return (ordersTable, itemsTable);
                }
            }
        }

        public int InsertUpdateDeleteOperation(string storedProcedureName, SqlParameter[] parameters)
        {
            using (SqlConnection con = new SqlConnection(conn))
            {
                con.Open();
                using (SqlCommand cmd = new SqlCommand(storedProcedureName, con))
                {
                    cmd.CommandType = System.Data.CommandType.StoredProcedure;
                    if (parameters != null)
                    {
                        cmd.Parameters.AddRange(parameters);
                    }
                    int count = cmd.ExecuteNonQuery();
                    return count;
                }
            }
        }
    }

    }
