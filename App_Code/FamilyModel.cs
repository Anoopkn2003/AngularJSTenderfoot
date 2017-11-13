using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for FamilyModel
/// </summary>
public class FamilyModel
{
    public string Name;
    public string City;
    public int Age;
    public int Id;

    public FamilyModel()
    {
    }
}

public class FamilyList
{
    public List<FamilyModel> lstFM = new List<FamilyModel>();
}